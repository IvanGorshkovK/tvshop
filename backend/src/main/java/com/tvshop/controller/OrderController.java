package com.tvshop.controller;

import com.tvshop.domain.User;
import com.tvshop.dto.OrderRequest;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.QuickOrderRequest;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.UserRepository;
import com.tvshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public OrderResponse create(Authentication auth, @Valid @RequestBody OrderRequest req) {
        return orderService.create(currentUser(auth), req);
    }

    @PostMapping("/quick")
    public OrderResponse quick(Authentication auth, @Valid @RequestBody QuickOrderRequest req) {
        User user = null;
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            user = userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return orderService.quickOrder(user, req);
    }

    @GetMapping
    public List<OrderResponse> myOrders(Authentication auth) {
        return orderService.myOrders(currentUser(auth));
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
    }
}
