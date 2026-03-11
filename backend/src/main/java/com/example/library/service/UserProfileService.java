package com.example.library.service;

import com.example.library.dto.UserDtos;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserProfileService(UserRepository userRepository, CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public UserDtos.UserProfileResponse me() {
        Long userId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserDtos.UserProfileResponse updateMe(UserDtos.UpdateProfileRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.email() != null && !request.email().isBlank() && !request.email().equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmail(request.email()).ifPresent(existing -> {
                if (!existing.getId().equals(userId)) {
                    throw new IllegalArgumentException("Email already in use");
                }
            });
            user.setEmail(request.email());
        }

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.firstName() != null) {
            user.setFirstName(normalize(request.firstName()));
        }
        if (request.lastName() != null) {
            user.setLastName(normalize(request.lastName()));
        }
        if (request.birthDate() != null) {
            user.setBirthDate(request.birthDate());
        }
        if (request.country() != null) {
            user.setCountry(normalize(request.country()));
        }
        if (request.city() != null) {
            user.setCity(normalize(request.city()));
        }
        if (request.postalCode() != null) {
            user.setPostalCode(normalize(request.postalCode()));
        }
        if (request.street() != null) {
            user.setStreet(normalize(request.street()));
        }
        if (request.houseNumber() != null) {
            user.setHouseNumber(normalize(request.houseNumber()));
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(normalize(request.phoneNumber()));
        }

        return toResponse(userRepository.save(user));
    }

    private String normalize(String value) {
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private UserDtos.UserProfileResponse toResponse(User user) {
        return new UserDtos.UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFirstName(),
                user.getLastName(),
                user.getBirthDate(),
                user.getCountry(),
                user.getCity(),
                user.getPostalCode(),
                user.getStreet(),
                user.getHouseNumber(),
                user.getPhoneNumber(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
