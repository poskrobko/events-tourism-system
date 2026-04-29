package com.example.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String fullName
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record PasswordResetRequest(
            @Email @NotBlank String email
    ) {}

    public record PasswordResetVerifyRequest(
            @Email @NotBlank String email,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "Code must contain 6 digits") String code
    ) {}

    public record PasswordResetConfirmRequest(
            @Email @NotBlank String email,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "Code must contain 6 digits") String code,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String newPassword
    ) {}

    public record MessageResponse(String message) {}

    public record AuthResponse(String token, String email, String role) {}
}
