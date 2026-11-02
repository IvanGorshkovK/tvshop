package com.tvshop.service;

import com.tvshop.domain.CartItem;
import com.tvshop.domain.Order;
import com.tvshop.domain.OrderItem;
import com.tvshop.domain.OrderStatus;
import com.tvshop.domain.Product;
import com.tvshop.domain.User;
import com.tvshop.dto.CounterpartyResponse;
import com.tvshop.dto.GuestOrderRequest;
import com.tvshop.dto.OrderItemResponse;
import com.tvshop.dto.OrderItemUpdateRequest;
import com.tvshop.dto.OrderRequest;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.OrderUpdateRequest;
import com.tvshop.dto.PageResponse;
import com.tvshop.dto.QuickOrderRequest;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.CartItemRepository;
import com.tvshop.repository.OrderRepository;
import com.tvshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
                .filter(o -> !o.isDeleted())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> allOrders(OrderStatus status, LocalDate from, LocalDate to, String phone, String address, Long id, int page, int size, String sort) {
        Specification<Order> spec = Specification.where(null);
        spec = spec.and((root, cq, cb) -> cb.equal(root.get("deleted"), false));
        if (id != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("id"), id));
        }
        if (status != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("status"), status));
        }
        if (from != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
        }
        if (to != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
        }
        if (phone != null && !phone.isBlank()) {
            spec = spec.and((root, cq, cb) -> cb.like(cb.lower(root.get("phone")), "%" + phone.trim().toLowerCase() + "%"));
        }
        if (address != null && !address.isBlank()) {
            spec = spec.and((root, cq, cb) -> cb.like(cb.lower(root.get("address")), "%" + address.trim().toLowerCase() + "%"));
        }

        Sort sortOrder = switch (sort == null ? "" : sort) {
            case "total_asc" -> Sort.by("total").ascending();
            case "total_desc" -> Sort.by("total").descending();
            case "date_asc" -> Sort.by("createdAt").ascending();
            default -> Sort.by("createdAt").descending();
        };
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<Order> result = orderRepository.findAll(spec, PageRequest.of(safePage, safeSize, sortOrder));
        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
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
        if (req.managerComment() != null) order.setManagerComment(req.managerComment());

        if (req.items() != null) {
            order.getItems().clear();
            BigDecimal total = BigDecimal.ZERO;
            for (OrderItemUpdateRequest it : req.items()) {
                if (it.productId() == null) continue;
                Product p = productRepository.findById(it.productId())
                        .orElseThrow(() -> new NotFoundException("Товар не найден"));
                int qty = it.quantity() > 0 ? it.quantity() : 1;
                OrderItem oi = new OrderItem();
                oi.setProduct(p);
                oi.setProductName(p.getName());
                oi.setImageUrl(p.getImageUrl());
                oi.setPrice(it.price() != null ? it.price() : p.getPrice());
                oi.setQuantity(qty);
                order.addItem(oi);
                total = total.add(oi.getPrice().multiply(BigDecimal.valueOf(qty)));
            }
            if (order.getItems().isEmpty()) {
                throw new BadRequestException("В заказе должен быть хотя бы один товар");
            }
            order.setTotal(total);
        }

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

    @Transactional
    public OrderResponse guestOrder(GuestOrderRequest req) {
        Order order = new Order();
        order.setStatus(OrderStatus.NEW);
        order.setFullName(req.fullName());
        order.setPhone(req.phone());
        order.setEmail(req.email());
        order.setAddress(req.address());
        order.setComment(req.comment());

        BigDecimal total = BigDecimal.ZERO;
        for (GuestOrderRequest.GuestOrderItem gi : req.items()) {
            Product p = productRepository.findById(gi.productId())
                    .orElseThrow(() -> new NotFoundException("Товар не найден"));
            int qty = gi.quantity() > 0 ? gi.quantity() : 1;
            if (qty > p.getStock()) {
                throw new BadRequestException("Недостаточно товара «" + p.getName() + "» на складе");
            }
            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setProductName(p.getName());
            oi.setImageUrl(p.getImageUrl());
            oi.setPrice(p.getPrice());
            oi.setQuantity(qty);
            order.addItem(oi);

            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));
            p.setStock(p.getStock() - qty);
            productRepository.save(p);
        }

        if (order.getItems().isEmpty()) {
            throw new BadRequestException("Корзина пуста");
        }
        order.setTotal(total);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<CounterpartyResponse> counterparties() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        Map<String, List<Order>> groups = new LinkedHashMap<>();
        for (Order o : orders) {
            if (o.isDeleted()) continue;
            String key = (o.getEmail() != null && !o.getEmail().isBlank()) ? o.getEmail().toLowerCase()
                    : (o.getPhone() != null && !o.getPhone().isBlank()) ? o.getPhone().trim()
                    : (o.getFullName() != null && !o.getFullName().isBlank()) ? o.getFullName().toLowerCase()
                    : "guest-" + o.getId();
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(o);
        }

        List<CounterpartyResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<Order>> e : groups.entrySet()) {
            List<Order> list = e.getValue();
            Order latest = list.get(0);
            BigDecimal total = list.stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new CounterpartyResponse(
                    e.getKey(),
                    latest.getFullName(),
                    latest.getPhone(),
                    latest.getEmail(),
                    list.size(),
                    total,
                    list.stream().map(this::toResponse).toList()));
        }
        return result;
    }

    @Transactional
    public void updateCounterparty(String key, String name, String phone, String email) {
        List<Order> orders = findOrdersByKey(key);
        for (Order o : orders) {
            if (name != null && !name.isBlank()) o.setFullName(name.trim());
            if (phone != null && !phone.isBlank()) o.setPhone(phone.trim());
            if (email != null && !email.isBlank()) o.setEmail(email.trim());
        }
        orderRepository.saveAll(orders);
    }

    @Transactional
    public void deleteCounterparty(String key) {
        List<Order> orders = findOrdersByKey(key);
        for (Order o : orders) {
            o.setDeleted(true);
        }
        orderRepository.saveAll(orders);
    }

    private List<Order> findOrdersByKey(String key) {
        if (key == null || key.isBlank()) return List.of();
        return orderRepository.findAll().stream()
                .filter(o -> !o.isDeleted())
                .filter(o -> counterpartyKey(o).equals(key))
                .toList();
    }

    private String counterpartyKey(Order o) {
        if (o.getEmail() != null && !o.getEmail().isBlank()) return o.getEmail().toLowerCase();
        if (o.getPhone() != null && !o.getPhone().isBlank()) return o.getPhone().trim();
        if (o.getFullName() != null && !o.getFullName().isBlank()) return o.getFullName().toLowerCase();
        return "guest-" + o.getId();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> ordersByUser(Long userId) {
        return orderRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .filter(o -> !o.isDeleted())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> trash() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(Order::isDeleted)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void softDelete(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));
        order.setDeleted(true);
        orderRepository.save(order);
    }

    @Transactional
    public OrderResponse restore(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));
        order.setDeleted(false);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public void permanentDelete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Заказ не найден");
        }
        orderRepository.deleteById(id);
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
                o.getManagerComment(),
                o.getCreatedAt(),
                items);
    }

    @Transactional(readOnly = true)
    public String exportCsv() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(o -> !o.isDeleted())
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("ID;Дата;Статус;ФИО;Телефон;Email;Адрес;Комментарий;Сумма;Товары\n");
        for (Order o : orders) {
            String items = o.getItems().stream()
                    .map(oi -> oi.getProductName() + " x" + oi.getQuantity())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            sb.append(o.getId()).append(';')
                    .append(o.getCreatedAt()).append(';')
                    .append(o.getStatus()).append(';')
                    .append(csv(o.getFullName())).append(';')
                    .append(csv(o.getPhone())).append(';')
                    .append(csv(o.getEmail())).append(';')
                    .append(csv(o.getAddress())).append(';')
                    .append(csv(o.getComment())).append(';')
                    .append(o.getTotal()).append(';')
                    .append(csv(items)).append('\n');
        }
        return sb.toString();
    }

    private String csv(String s) {
        if (s == null) return "";
        return '"' + s.replace("\"", "\"\"").replace(";", ",") + '"';
    }
}
