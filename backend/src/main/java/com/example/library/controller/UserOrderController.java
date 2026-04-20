package com.example.library.controller;

import com.example.library.dto.OrderDtos;
import com.example.library.service.OrderService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserOrderController {
    private final OrderService orderService;

    public UserOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/tickets/purchase")
    public OrderDtos.OrderResponse purchase(@Valid @RequestBody OrderDtos.PurchaseTicketRequest request, Principal principal) {
        return orderService.purchase(principal.getName(), request);
    }

    @GetMapping("/tickets")
    public List<OrderDtos.TicketView> myTickets(Principal principal) {
        return orderService.getMyTickets(principal.getName());
    }

    @GetMapping("/orders")
    public List<OrderDtos.OrderResponse> myOrders(Principal principal) {
        return orderService.myOrders(principal.getName());
    }
}
