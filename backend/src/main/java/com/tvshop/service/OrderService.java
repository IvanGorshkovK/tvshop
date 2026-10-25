package com.tvshop.service;

import com.tvshop.domain.CartItem;
import com.tvshop.domain.Order;
import com.tvshop.domain.OrderItem;
import com.tvshop.domain.OrderStatus;
import com.tvshop.domain.Product;
import com.tvshop.domain.User;
import com.tvshop.dto.OrderItemResponse;
import com.tvshop.dto.OrderRequest;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.OrderUpdateRequest;
import com.tvshop.dto.QuickOrderRequest;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CartItemRepository;
import com.tvshop.repository.OrderRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Value("${app.base-url:}")
    private String baseUrl;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse create(User user, OrderRequest req) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Корзина пуста");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.NEW);
        order.setFullName(req.fullName());
        order.setPhone(req.phone());
        order.setEmail(req.email());
        order.setAddress(req.address());
        order.setComment(req.comment());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (ci.getQuantity() > p.getStock()) {
                throw new BadRequestException("Недостаточно товара «" + p.getName() + "» на складе");
            }
            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setProductName(p.getName());
            oi.setImageUrl(p.getImageUrl());
            oi.setPrice(p.getPrice());
            oi.setQuantity(ci.getQuantity());
            order.addItem(oi);

            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);
        }

        order.setTotal(total);
        orderRepository.save(order);
        cartItemRepository.deleteByUser(user);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders(OrderStatus status, LocalDate from, LocalDate to) {
        Specification<Order> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("status"), status));
        }
        if (from != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
        }
        if (to != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
        }
        return orderRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));
        order.setStatus(status);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse update(Long id, OrderUpdateRequest req) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));
        if (req.status() != null) order.setStatus(req.status());
        if (req.fullName() != null) order.setFullName(req.fullName());
        if (req.phone() != null) order.setPhone(req.phone());
        if (req.email() != null) order.setEmail(req.email());
        if (req.address() != null) order.setAddress(req.address());
        if (req.comment() != null) order.setComment(req.comment());
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse quickOrder(User user, QuickOrderRequest req) {
        Product p = productRepository.findById(req.productId())
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        int qty = req.quantity() != null ? req.quantity() : 1;
        if (qty <= 0) qty = 1;
        if (qty > p.getStock()) {
            throw new BadRequestException("Недостаточно товара на складе");
        }

        Order order = new Order();
        if (user != null) {
            order.setUser(user);
        }
        order.setStatus(OrderStatus.NEW);
        order.setFullName(req.fullName());
        order.setPhone(req.phone());
        order.setEmail(user != null ? user.getEmail() : req.email());
        order.setAddress(req.address() != null ? req.address() : "");
        order.setComment("Быстрый заказ (в 1 клик)");

        OrderItem oi = new OrderItem();
        oi.setProduct(p);
        oi.setProductName(p.getName());
        oi.setImageUrl(p.getImageUrl());
        oi.setPrice(p.getPrice());
        oi.setQuantity(qty);
        order.addItem(oi);

        order.setTotal(p.getPrice().multiply(BigDecimal.valueOf(qty)));
        p.setStock(p.getStock() - qty);
        productRepository.save(p);
        orderRepository.save(order);
        return toResponse(order);
    }

    private String resolveUrl(String url) {
        if (url == null || url.isBlank() || url.startsWith("http")) return url;
        if (baseUrl == null || baseUrl.isBlank()) return url;
        String b = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String u = url.startsWith("/") ? url : "/" + url;
        return b + u;
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(oi -> new OrderItemResponse(
                        oi.getProduct() != null ? oi.getProduct().getId() : null,
                        oi.getProductName(),
                        resolveUrl(oi.getImageUrl()),
                        oi.getPrice(),
                        oi.getQuantity()))
                .toList();
        return new OrderResponse(
                o.getId(),
                o.getStatus(),
                o.getTotal(),
                o.getFullName(),
                o.getPhone(),
                o.getEmail(),
                o.getAddress(),
                o.getComment(),
                o.getCreatedAt(),
                items);
    }
}
