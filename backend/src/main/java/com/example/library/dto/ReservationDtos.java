package com.example.library.dto;

import com.example.library.model.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ReservationDtos {
    public record CreateReservationRequest(@NotNull Long userId, @NotNull Long bookId) {}
    public record ReservationResponse(Long id, Long userId, Long bookId, String bookTitle, ReservationStatus status,
                                      Instant createdAt, Instant notifiedAt, Instant expiresAt, Instant cancelledAt) {}
}
