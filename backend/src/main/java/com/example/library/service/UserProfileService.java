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
            user.setFullName(request.fullName());
        }

        return toResponse(userRepository.save(user));
    }

    private UserDtos.UserProfileResponse toResponse(User user) {
        return new UserDtos.UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
