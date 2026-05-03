package com.example.library.service;

import com.example.library.dto.UserDtos;
import com.example.library.model.Role;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserManagementService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDtos.UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserDtos.ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse createUser(UserDtos.CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already used");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.EVENT_MANAGER);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.UserResponse updateUser(Long userId, UserDtos.UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already used");
        }
        user.setEmail(normalizedEmail);
        user.setFullName(request.fullName());
        user.setPhone(request.phone() == null ? null : request.phone().trim());
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.ProfileResponse updateProfile(String email, UserDtos.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already used");
        }
        user.setEmail(normalizedEmail);
        user.setFullName((request.firstName().trim() + " " + request.lastName().trim()).trim());
        user.setAvatarUrl(request.avatarUrl() == null ? null : request.avatarUrl().trim());
        user.setPhone(request.phone() == null ? null : request.phone().trim());
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (admin.getId().equals(userId)) {
            throw new IllegalArgumentException("Admin cannot delete themselves");
        }
        if (userToDelete.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin user cannot be deleted");
        }
        userRepository.delete(userToDelete);
    }

    private UserDtos.UserResponse toResponse(User user) {
        return new UserDtos.UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getPhone(), user.getRole());
    }

    private UserDtos.ProfileResponse toProfileResponse(User user) {
        String[] parts = user.getFullName() == null ? new String[0] : user.getFullName().trim().split("\\s+");
        String firstName = parts.length > 0 ? parts[0] : "";
        String lastName = parts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)) : "";
        return new UserDtos.ProfileResponse(user.getId(), user.getEmail(), firstName, lastName, user.getAvatarUrl(), user.getPhone());
    }
}
