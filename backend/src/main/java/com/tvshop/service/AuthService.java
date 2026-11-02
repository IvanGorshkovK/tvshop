package com.tvshop.service;

import com.tvshop.domain.PasswordResetToken;
import com.tvshop.domain.Role;
import com.tvshop.domain.User;
import com.tvshop.dto.AuthResponse;
import com.tvshop.dto.LoginRequest;
import com.tvshop.dto.RegisterRequest;
import com.tvshop.exception.BadRequestException;
import com.tvshop.repository.PasswordResetTokenRepository;
import com.tvshop.repository.UserRepository;
import com.tvshop.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;

    @Value("${app.site-url:}")
    private String siteUrl;

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Пользователь с таким email уже существует");
        }
        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim().toLowerCase(), req.password()));
        User user = userRepository.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Пользователь не найден"));
        return toResponse(user);
    }

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Укажите email");
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user == null) {
            // Не раскрываем, существует ли email
            return Map.of("message", "Если такой email зарегистрирован, ссылка для сброса отправлена на почту");
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(user);
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(prt);

        String link = baseUrl() + "/reset-password?token=" + token;
        boolean sent = mailService.send(
                user.getEmail(),
                "Восстановление пароля TV Space",
                "Для сброса пароля перейдите по ссылке (действует 30 минут):\n" + link);

        Map<String, String> result = new LinkedHashMap<>();
        if (sent) {
            result.put("message", "Ссылка для сброса пароля отправлена на вашу почту");
        } else {
            result.put("message", "Почта не настроена (демо-режим). Используйте ссылку ниже:");
            result.put("demoLink", link);
        }
        return result;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Неверная ссылка для сброса");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Пароль должен быть не короче 6 символов");
        }
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Ссылка недействительна"));
        if (prt.isUsed() || prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ссылка недействительна или истекла");
        }
        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        prt.setUsed(true);
        tokenRepository.save(prt);
    }

    private String baseUrl() {
        return (siteUrl == null || siteUrl.isBlank()) ? "http://localhost:5173" : siteUrl.replaceAll("/+$", "");
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name());
    }
}
