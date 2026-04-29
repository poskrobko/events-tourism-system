package com.example.library.controller;

import com.example.library.dto.AuthDtos;
import com.example.library.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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


    @GetMapping("/email-exists")
    public AuthDtos.EmailExistsResponse checkEmailExists(@RequestParam @Email @NotBlank String email) {
        return authService.checkEmailExists(email);
    }

    @PostMapping("/password-reset/confirm")
    public AuthDtos.MessageResponse confirmPasswordReset(@Valid @RequestBody AuthDtos.PasswordResetConfirmRequest request) {
        return authService.confirmPasswordReset(request);
    }
}
