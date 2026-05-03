package com.example.library.controller;

import com.example.library.dto.OrderDtos;
import com.example.library.dto.UserDtos;
import com.example.library.service.OrderService;
import com.example.library.service.UserManagementService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserOrderController {
    private final OrderService orderService;
    private final UserManagementService userManagementService;

    public UserOrderController(OrderService orderService, UserManagementService userManagementService) {
        this.orderService = orderService;
        this.userManagementService = userManagementService;
    }

    @GetMapping("/profile")
    public UserDtos.ProfileResponse profile(Principal principal) {
        return userManagementService.getProfile(principal.getName());
    }

    @PutMapping("/profile")
    public UserDtos.ProfileResponse updateProfile(@Valid @RequestBody UserDtos.UpdateProfileRequest request, Principal principal) {
        return userManagementService.updateProfile(principal.getName(), request);
    }

    @PostMapping("/tickets/purchase")
    public OrderDtos.OrderResponse purchase(@Valid @RequestBody OrderDtos.PurchaseTicketRequest request, Principal principal) {
        return orderService.purchase(principal.getName(), request);
    }

    @GetMapping("/tickets")
    public List<OrderDtos.TicketView> myTickets(Principal principal) {
        return orderService.getMyTickets(principal.getName());
    }


    @PostMapping("/orders/{orderId}/pay")
    public OrderDtos.OrderResponse payOrder(@PathVariable Long orderId,
                                            @RequestBody(required = false) OrderDtos.PaymentActionRequest request,
                                            Principal principal) {
        return orderService.payOrder(principal.getName(), orderId, request);
    }

    @PostMapping("/orders/{orderId}/pay-later")
    public OrderDtos.OrderResponse payLater(@PathVariable Long orderId, Principal principal) {
        return orderService.postponePayment(principal.getName(), orderId);
    }

    @PostMapping("/orders/{orderId}/pay-decline")
    public OrderDtos.OrderResponse declinePayment(@PathVariable Long orderId, Principal principal) {
        return orderService.declinePayment(principal.getName(), orderId);
    }

    @PostMapping("/orders/{orderId}/refund")
    public OrderDtos.OrderResponse refundOrder(@PathVariable Long orderId, Principal principal) {
        return orderService.refundOrder(principal.getName(), orderId);
    }

    @DeleteMapping("/orders/{orderId}")
    public void cancelOrder(@PathVariable Long orderId, Principal principal) {
        orderService.cancelOrder(principal.getName(), orderId);
    }
    @GetMapping("/orders")
    public List<OrderDtos.OrderResponse> myOrders(Principal principal) {
        return orderService.myOrders(principal.getName());
    }
}
