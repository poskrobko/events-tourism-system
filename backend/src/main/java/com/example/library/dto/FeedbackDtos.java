package com.example.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class FeedbackDtos {
    public record RatingRequest(@Min(1) @Max(5) int score, long userId) {}

    public record ReviewRequest(Long reviewId, @NotBlank String text, long userId) {}

    public record ReviewResponse(Long id,
                                 Long bookId,
                                 Long userId,
                                 String text,
                                 String previousText,
                                 Integer ratingScore,
                                 Instant createdAt) {}

    public record PreferencesRequest(String preferredGenresCsv, String favoriteAuthorsCsv) {}
}
