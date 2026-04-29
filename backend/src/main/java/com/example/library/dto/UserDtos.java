package com.example.library.dto;

import com.example.library.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserDtos {
    public record UserResponse(Long id, String email, String fullName, Role role) {}

    public record CreateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String fullName
    ) {}

    public record UpdateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String fullName,
            @NotNull Role role,
            String password
    ) {}
}
