package com.example.library.service;

import com.example.library.dto.OrderDtos;
import com.example.library.model.Order;
import com.example.library.model.OrderItem;
import com.example.library.model.TicketType;
import com.example.library.model.User;
import com.example.library.repository.OrderItemRepository;
import com.example.library.repository.OrderRepository;
import com.example.library.repository.TicketTypeRepository;
import com.example.library.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        TicketTypeRepository ticketTypeRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderDtos.OrderResponse purchase(String userEmail, OrderDtos.PurchaseTicketRequest request) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        TicketType ticketType = ticketTypeRepository.findById(request.ticketTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));

        int available = ticketType.getQuantityTotal() - ticketType.getQuantitySold();
        if (request.quantity() > available) {
            throw new IllegalArgumentException("Not enough tickets available");
        }

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(Instant.now());
        order.setTotalAmount(ticketType.getPrice().multiply(BigDecimal.valueOf(request.quantity())));
        orderRepository.save(order);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setTicketType(ticketType);
        item.setQuantity(request.quantity());
        item.setUnitPrice(ticketType.getPrice());
        orderItemRepository.save(item);

        ticketType.setQuantitySold(ticketType.getQuantitySold() + request.quantity());
        ticketTypeRepository.save(ticketType);

        return toOrderResponse(order, List.of(item));
    }

    public List<OrderDtos.TicketView> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderItemRepository.findByOrderUserId(user.getId()).stream().map(item -> new OrderDtos.TicketView(
                item.getId(),
                item.getOrder().getId(),
                item.getTicketType().getEvent().getId(),
                item.getTicketType().getEvent().getTitle(),
                item.getTicketType().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getOrder().getCreatedAt()
        )).toList();
    }

    public List<OrderDtos.OrderResponse> myOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    public List<OrderDtos.OrderResponse> allOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toOrderResponse).toList();
    }

    private OrderDtos.OrderResponse toOrderResponse(Order order) {
        var items = orderItemRepository.findByOrderId(order.getId());
        return toOrderResponse(order, items);
    }

    private OrderDtos.OrderResponse toOrderResponse(Order order, List<OrderItem> items) {
        return new OrderDtos.OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getCreatedAt(),
                order.getTotalAmount(),
                items.stream().map(i -> new OrderDtos.OrderItemResponse(
                        i.getId(), i.getTicketType().getId(), i.getTicketType().getName(), i.getQuantity(), i.getUnitPrice()
                )).toList()
        );
    }
}
