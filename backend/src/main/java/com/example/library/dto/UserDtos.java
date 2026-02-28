package com.example.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public class UserDtos {
    public record UserProfileResponse(Long id, String email, String fullName, Set<String> roles) {}

    public record UpdateProfileRequest(@Email String email, @NotBlank String fullName) {}
}
