package com.example.library.controller;

import com.example.library.dto.UserDtos;
import com.example.library.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserProfileController {
    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public UserDtos.UserProfileResponse me() {
        return userProfileService.me();
    }

    @PatchMapping
    public UserDtos.UserProfileResponse updateMe(@Valid @RequestBody UserDtos.UpdateProfileRequest request) {
        return userProfileService.updateMe(request);
    }
}
