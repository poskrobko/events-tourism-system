package com.example.library.service;

import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Authentication is required");
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getId();
    }

    public boolean isAdmin() {
        return hasAnyRole("ROLE_ADMIN");
    }

    public boolean isLibrarianOrAdmin() {
        return hasAnyRole("ROLE_LIBRARIAN", "ROLE_ADMIN");
    }

    public void requireSameUserOrAdmin(Long targetUserId) {
        if (isAdmin()) {
            return;
        }
        Long currentUserId = getCurrentUserId();
        if (!currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Access denied for requested user");
        }
    }

    private boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> {
                    for (String role : roles) {
                        if (role.equals(authority)) {
                            return true;
                        }
                    }
                    return false;
                });
    }
}
