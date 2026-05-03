package com.example.library.dto;

import com.example.library.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserDtos {
    public record UserResponse(Long id, String email, String fullName, String avatarUrl, String phone, Role role) {}

    public record CreateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String fullName
    ) {}

    public record UpdateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String fullName,
            String phone,
            @NotNull Role role,
            String password
    ) {}

    public record ProfileResponse(Long id, String email, String firstName, String lastName, String avatarUrl, String phone) {}

    public record UpdateProfileRequest(
            @Email @NotBlank String email,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String avatarUrl,
            String phone
    ) {}
}
