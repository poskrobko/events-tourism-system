package com.example.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.Set;

public class UserDtos {
    public record UserProfileResponse(
            Long id,
            String email,
            String fullName,
            String firstName,
            String lastName,
            LocalDate birthDate,
            String country,
            String city,
            String postalCode,
            String street,
            String houseNumber,
            String phoneNumber,
            Set<String> roles
    ) {}

    public record UpdateProfileRequest(
            @Email String email,
            String fullName,
            String firstName,
            String lastName,
            LocalDate birthDate,
            String country,
            String city,
            String postalCode,
            String street,
            String houseNumber,
            @Pattern(regexp = "^\\+?[0-9()\\-\\s]{5,25}$", message = "Введите корректный номер телефона") String phoneNumber
    ) {}
}
