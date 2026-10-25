package com.tvshop.service;

import com.tvshop.domain.CartItem;
import com.tvshop.domain.Product;
import com.tvshop.domain.User;
import com.tvshop.dto.CartItemRequest;
import com.tvshop.dto.CartItemResponse;
import com.tvshop.dto.CartResponse;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CartItemRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse get(User user) {
        List<CartItem> items = cartItemRepository.findByUser(user);
        return buildResponse(items);
    }

    @Transactional
    public CartResponse add(User user, CartItemRequest req) {
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        CartItem item = cartItemRepository.findByUserAndProductId(user, product.getId()).orElse(null);
        if (item == null) {
            item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(req.quantity());
        } else {
            item.setQuantity(item.getQuantity() + req.quantity());
        }
        if (item.getQuantity() > product.getStock()) {
            throw new BadRequestException("Недостаточно товара «" + product.getName() + "» на складе");
        }
        cartItemRepository.save(item);
        return get(user);
    }

    @Transactional
    public CartResponse updateQuantity(User user, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Позиция корзины не найдена"));
        assertOwnership(user, item);
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStock()) {
                throw new BadRequestException("Недостаточно товара на складе");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return get(user);
    }

    @Transactional
    public CartResponse remove(User user, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Позиция корзины не найдена"));
        assertOwnership(user, item);
        cartItemRepository.delete(item);
        return get(user);
    }

    @Transactional
    public void clear(User user) {
        cartItemRepository.deleteByUser(user);
    }

    private void assertOwnership(User user, CartItem item) {
        if (item.getUser() == null || !item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Нет доступа к этой позиции");
        }
    }

    private CartResponse buildResponse(List<CartItem> items) {
        List<CartItemResponse> responses = items.stream().map(ci -> {
            Product p = ci.getProduct();
            return new CartItemResponse(
                    ci.getId(),
                    p.getId(),
                    p.getName(),
                    p.getSlug(),
                    p.getImageUrl(),
                    p.getPrice(),
                    ci.getQuantity(),
                    p.getStock());
        }).toList();

        BigDecimal total = items.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int count = items.stream().mapToInt(CartItem::getQuantity).sum();
        return new CartResponse(responses, total, count);
    }
}
