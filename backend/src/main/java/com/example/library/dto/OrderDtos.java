package com.example.library.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDtos {
    public record PurchaseTicketRequest(
            @NotNull Long ticketTypeId,
            @NotNull @Min(1) Integer quantity,
            String paymentMethod
    ) {}

    public record PaymentActionRequest(String paymentMethod) {}

    public record TicketView(
            Long orderItemId,
            Long orderId,
            Long eventId,
            String eventTitle,
            String ticketType,
            Integer quantity,
            BigDecimal unitPrice,
            Instant purchasedAt,
            String paymentStatus
    ) {}

    public record OrderItemResponse(
            Long id,
            Long ticketTypeId,
            Long eventId,
            String eventTitle,
            String ticketType,
            Integer quantity,
            BigDecimal unitPrice
    ) {}

    public record OrderResponse(
            Long id,
            Long userId,
            String userEmail,
            Instant createdAt,
            BigDecimal totalAmount,
            List<OrderItemResponse> items,
            String paymentStatus,
            String paymentMethod,
            Boolean isEventCompleted
    ) {}
}
