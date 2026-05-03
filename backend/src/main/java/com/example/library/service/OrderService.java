package com.example.library.service;

import com.example.library.dto.OrderDtos;
import com.example.library.model.Order;
import com.example.library.model.OrderItem;
import com.example.library.model.Payment;
import com.example.library.model.TicketType;
import com.example.library.model.User;
import com.example.library.repository.OrderItemRepository;
import com.example.library.repository.OrderRepository;
import com.example.library.repository.PaymentRepository;
import com.example.library.repository.TicketTypeRepository;
import com.example.library.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final EventService eventService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        TicketTypeRepository ticketTypeRepository, UserRepository userRepository,
                        PaymentRepository paymentRepository, EventService eventService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.eventService = eventService;
    }

    @Transactional
    public OrderDtos.OrderResponse purchase(String userEmail, OrderDtos.PurchaseTicketRequest request) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        TicketType ticketType = ticketTypeRepository.findById(request.ticketTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));

        validateTicketPurchaseWindow(ticketType);

        int available = ticketType.getQuantityTotal() - ticketType.getQuantitySold();
        if (request.quantity() > available) {
            throw new IllegalArgumentException("Not enough tickets available");
        }

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(Instant.now());
        order.setTotalAmount(ticketType.getPrice().multiply(BigDecimal.valueOf(request.quantity())));
        order.setStatus("PENDING");
        orderRepository.save(order);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setTicketType(ticketType);
        item.setQuantity(request.quantity());
        item.setUnitPrice(ticketType.getPrice());
        item.setStatus("ACTIVE");
        orderItemRepository.save(item);

        String method = (request.paymentMethod() == null || request.paymentMethod().isBlank()) ? "CARD" : request.paymentMethod();
        createPendingPayment(order, method);
        return toOrderResponse(order, List.of(item));
    }

    @Transactional
    public OrderDtos.OrderResponse payOrder(String userEmail, Long orderId, OrderDtos.PaymentActionRequest request) {
        Order order = findUserOrder(userEmail, orderId);
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if ("PAID".equals(payment.getStatus())) {
            return toOrderResponse(order);
        }

        var items = orderItemRepository.findByOrderId(order.getId());
        for (var item : items) {
            TicketType ticketType = ticketTypeRepository.findById(item.getTicketType().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
            validateTicketPurchaseWindow(ticketType);

            int available = ticketType.getQuantityTotal() - ticketType.getQuantitySold();
            if (item.getQuantity() > available) {
                throw new IllegalArgumentException("Not enough tickets available");
            }
        }

        payment.setStatus("PAID");
        payment.setPaidAt(Instant.now());
        if (request != null && request.paymentMethod() != null && !request.paymentMethod().isBlank()) {
            payment.setPaymentMethod(request.paymentMethod());
        }
        paymentRepository.save(payment);
        order.setStatus("PAID");
        order.setRefundedAt(null);
        orderRepository.save(order);

        for (var item : items) {
            TicketType ticketType = ticketTypeRepository.findById(item.getTicketType().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
            item.setStatus("PAID");
            item.setRefundedAt(null);
            orderItemRepository.save(item);
            ticketType.setQuantitySold(ticketType.getQuantitySold() + item.getQuantity());
            ticketTypeRepository.save(ticketType);
            eventService.refreshEventAvailableTickets(ticketType.getEvent().getId());
        }
        return toOrderResponse(order, items);
    }

    @Transactional
    public OrderDtos.OrderResponse postponePayment(String userEmail, Long orderId) {
        Order order = findUserOrder(userEmail, orderId);
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        payment.setStatus("PENDING");
        paymentRepository.save(payment);
        order.setStatus("PENDING");
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    @Transactional
    public OrderDtos.OrderResponse declinePayment(String userEmail, Long orderId) {
        Order order = findUserOrder(userEmail, orderId);
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        payment.setStatus("DECLINED");
        paymentRepository.save(payment);
        order.setStatus("DECLINED");
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    @Transactional
    public OrderDtos.OrderResponse refundOrder(String userEmail, Long orderId) {
        Order order = findUserOrder(userEmail, orderId);
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (!"PAID".equals(payment.getStatus())) {
            throw new IllegalArgumentException("Only paid orders can be refunded");
        }

        var items = orderItemRepository.findByOrderId(order.getId());
        for (var item : items) {
            TicketType ticketType = ticketTypeRepository.findById(item.getTicketType().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
            int updatedSold = Math.max(0, ticketType.getQuantitySold() - item.getQuantity());
            ticketType.setQuantitySold(updatedSold);
            ticketTypeRepository.save(ticketType);
            eventService.refreshEventAvailableTickets(ticketType.getEvent().getId());
        }

        Instant refundedAt = Instant.now();
        payment.setStatus("REFUNDED");
        paymentRepository.save(payment);
        order.setStatus("REFUNDED");
        order.setRefundedAt(refundedAt);
        orderRepository.save(order);
        for (var item : items) {
            item.setStatus("REFUNDED");
            item.setRefundedAt(refundedAt);
            orderItemRepository.save(item);
        }
        return toOrderResponse(order, items);
    }


    @Transactional
    public void cancelOrder(String userEmail, Long orderId) {
        Order order = findUserOrder(userEmail, orderId);
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId()).orElse(null);
        String paymentStatus = payment != null ? payment.getStatus() : "PENDING";
        if (!"PENDING".equals(paymentStatus)) {
            throw new IllegalArgumentException("Only pending orders can be cancelled");
        }

        orderItemRepository.deleteByOrderId(order.getId());
        paymentRepository.deleteByOrderId(order.getId());
        orderRepository.delete(order);
    }

    @Transactional
    public List<OrderDtos.TicketView> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderItemRepository.findByOrderUserId(user.getId()).stream().map(item -> {
            Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(item.getOrder().getId()).orElse(null);
            return new OrderDtos.TicketView(
                    item.getId(),
                    item.getOrder().getId(),
                    item.getTicketType().getEvent().getId(),
                    item.getTicketType().getEvent().getTitle(),
                    item.getTicketType().getName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getOrder().getCreatedAt(),
                    payment != null ? payment.getStatus() : "PENDING"
            );
        }).filter(ticket -> "PAID".equals(ticket.paymentStatus())).toList();
    }

    @Transactional
    public List<OrderDtos.OrderResponse> myOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        cleanupExpiredUnpaidOrders(user.getId());
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toOrderResponse)
                .toList();
    }


    private void cleanupExpiredUnpaidOrders(Long userId) {
        var orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (var order : orders) {
            Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId()).orElse(null);
            String paymentStatus = payment != null ? payment.getStatus() : "PENDING";
            if (!"PENDING".equals(paymentStatus)) {
                continue;
            }

            boolean eventCompleted = orderItemRepository.findByOrderId(order.getId()).stream()
                    .anyMatch(item -> item.getTicketType().getEvent().getEndDateTime().isBefore(LocalDateTime.now()));
            if (!eventCompleted) {
                continue;
            }

            orderItemRepository.deleteByOrderId(order.getId());
            paymentRepository.deleteByOrderId(order.getId());
            orderRepository.delete(order);
        }
    }

    @Transactional
    public List<OrderDtos.OrderResponse> allOrders() { return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toOrderResponse).toList(); }
    @Transactional
    public List<OrderDtos.OrderResponse> ordersForManager(String managerEmail) { return orderRepository.findOrdersByManagerEmail(managerEmail).stream().map(this::toOrderResponse).toList(); }

    private Order findUserOrder(String userEmail, Long orderId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getUser().getId().equals(user.getId())) throw new IllegalArgumentException("Order does not belong to user");
        return order;
    }


    private void validateTicketPurchaseWindow(TicketType ticketType) {
        LocalDateTime eventStart = ticketType.getEvent().getStartDateTime();
        LocalDateTime now = LocalDateTime.now();
        if (!now.isBefore(eventStart)) {
            throw new IllegalArgumentException("Cannot buy tickets for an event that has already started or ended");
        }

        LocalDateTime purchaseDeadline = eventStart.minusHours(2);
        if (now.isAfter(purchaseDeadline)) {
            throw new IllegalArgumentException("Tickets can only be purchased no later than 2 hours before the event starts");
        }
    }

    private void createPendingPayment(Order order, String method) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("BYN");
        payment.setPaymentMethod(method);
        payment.setStatus("PENDING");
        payment.setCreatedAt(Instant.now());
        paymentRepository.save(payment);
    }

    private OrderDtos.OrderResponse toOrderResponse(Order order) {
        var items = orderItemRepository.findByOrderId(order.getId());
        return toOrderResponse(order, items);
    }

    private OrderDtos.OrderResponse toOrderResponse(Order order, List<OrderItem> items) {
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId()).orElse(null);
        return new OrderDtos.OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getCreatedAt(),
                order.getTotalAmount(),
                items.stream().map(i -> new OrderDtos.OrderItemResponse(
                        i.getId(),
                        i.getTicketType().getId(),
                        i.getTicketType().getEvent().getId(),
                        i.getTicketType().getEvent().getTitle(),
                        i.getTicketType().getName(),
                        i.getQuantity(),
                        i.getUnitPrice()
                )).toList(),
                payment != null ? payment.getStatus() : "PENDING",
                payment != null ? payment.getPaymentMethod() : null,
                items.stream().findFirst()
                        .map(i -> i.getTicketType().getEvent().getEndDateTime().isBefore(java.time.LocalDateTime.now()))
                        .orElse(false)
        );
    }
}
