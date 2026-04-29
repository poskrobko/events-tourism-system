package com.example.library.controller;

import com.example.library.dto.AuthDtos;
import com.example.library.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/password-reset/request")
    public AuthDtos.MessageResponse requestPasswordReset(@Valid @RequestBody AuthDtos.PasswordResetRequest request) {
        return authService.requestPasswordResetCode(request);
    }

    @PostMapping("/password-reset/verify")
    public AuthDtos.MessageResponse verifyPasswordReset(@Valid @RequestBody AuthDtos.PasswordResetVerifyRequest request) {
        return authService.verifyPasswordResetCode(request);
    }

    @PostMapping("/password-reset/confirm")
    public AuthDtos.MessageResponse confirmPasswordReset(@Valid @RequestBody AuthDtos.PasswordResetConfirmRequest request) {
        return authService.confirmPasswordReset(request);
    }
}
