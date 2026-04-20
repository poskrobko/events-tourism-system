package com.example.library.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EventDtos {
    public record EventRequest(
            @NotBlank String title,
            @NotBlank String description,
            @NotBlank String city,
            @NotBlank String venue,
            @NotNull BigDecimal latitude,
            @NotNull BigDecimal longitude,
            String mapUrl,
            @NotNull LocalDateTime startDateTime,
            @NotNull LocalDateTime endDateTime
    ) {}

    public record EventResponse(
            Long id,
            String title,
            String description,
            String city,
            String venue,
            BigDecimal latitude,
            BigDecimal longitude,
            String mapUrl,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            BigDecimal minTicketPrice
    ) {}

    public record ProgramItemRequest(
            @NotBlank String title,
            @NotNull LocalDateTime startDateTime,
            @NotNull LocalDateTime endDateTime,
            String description
    ) {}

    public record ProgramItemResponse(
            Long id,
            Long eventId,
            String title,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String description
    ) {}

    public record TicketTypeRequest(
            @NotBlank String name,
            @NotNull @DecimalMin("0.0") BigDecimal price,
            @NotNull @Min(1) Integer quantityTotal
    ) {}

    public record TicketTypeResponse(
            Long id,
            Long eventId,
            String name,
            BigDecimal price,
            Integer quantityTotal,
            Integer quantitySold,
            Integer quantityAvailable
    ) {}

    public record EventDetailsResponse(
            EventResponse event,
            List<ProgramItemResponse> program,
            List<TicketTypeResponse> ticketTypes,
            String calendarUrl
    ) {}
}
