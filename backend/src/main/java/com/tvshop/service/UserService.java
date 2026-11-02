package com.tvshop.service;

import com.tvshop.domain.User;
import com.tvshop.dto.OrderResponse;
import com.tvshop.dto.UserResponse;
import com.tvshop.exception.BadRequestException;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       OrderService orderService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .sorted(Comparator.comparing(UserResponse::id).reversed())
                .toList();
    }

    @Transactional
    public UserResponse toggleActive(Long id) {
        User u = find(id);
        u.setActive(!u.isActive());
        userRepository.save(u);
        return toResponse(u);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Пароль должен быть не короче 6 символов");
        }
        User u = find(id);
        u.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
    }

    private UserResponse toResponse(User u) {
        List<OrderResponse> orders = orderService.ordersByUser(u.getId());
        BigDecimal total = orders.stream()
                .map(OrderResponse::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getRole().name(),
                u.isActive(),
                u.getCreatedAt(),
                orders.size(),
                total,
                orders);
    }
}
