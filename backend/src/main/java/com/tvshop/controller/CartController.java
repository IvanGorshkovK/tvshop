package com.tvshop.controller;

import com.tvshop.domain.User;
import com.tvshop.dto.CartItemRequest;
import com.tvshop.dto.CartResponse;
import com.tvshop.exception.NotFoundException;
import com.tvshop.repository.UserRepository;
import com.tvshop.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public CartResponse get(Authentication auth) {
        return cartService.get(currentUser(auth));
    }

    @PostMapping
    public CartResponse add(Authentication auth, @Valid @RequestBody CartItemRequest req) {
        return cartService.add(currentUser(auth), req);
    }

    @PatchMapping("/{itemId}")
    public CartResponse updateQuantity(Authentication auth,
                                       @PathVariable Long itemId,
                                       @RequestParam int quantity) {
        return cartService.updateQuantity(currentUser(auth), itemId, quantity);
    }

    @DeleteMapping("/{itemId}")
    public CartResponse remove(Authentication auth, @PathVariable Long itemId) {
        return cartService.remove(currentUser(auth), itemId);
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
    }
}
