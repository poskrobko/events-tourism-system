package com.example.library.controller;

import com.example.library.dto.EventDtos;
import com.example.library.dto.OrderDtos;
import com.example.library.service.EventService;
import com.example.library.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final EventService eventService;
    private final OrderService orderService;

    public AdminController(EventService eventService, OrderService orderService) {
        this.eventService = eventService;
        this.orderService = orderService;
    }

    @PostMapping("/events")
    public EventDtos.EventResponse createEvent(@Valid @RequestBody EventDtos.EventRequest request) {
        return eventService.createEvent(request);
    }

    @PutMapping("/events/{eventId}")
    public EventDtos.EventResponse updateEvent(@PathVariable Long eventId, @Valid @RequestBody EventDtos.EventRequest request) {
        return eventService.updateEvent(eventId, request);
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
    }

    @PostMapping("/events/{eventId}/program")
    public EventDtos.ProgramItemResponse addProgramItem(@PathVariable Long eventId,
                                                        @Valid @RequestBody EventDtos.ProgramItemRequest request) {
        return eventService.addProgramItem(eventId, request);
    }

    @PutMapping("/program/{itemId}")
    public EventDtos.ProgramItemResponse updateProgramItem(@PathVariable Long itemId,
                                                           @Valid @RequestBody EventDtos.ProgramItemRequest request) {
        return eventService.updateProgramItem(itemId, request);
    }

    @DeleteMapping("/program/{itemId}")
    public void deleteProgramItem(@PathVariable Long itemId) {
        eventService.deleteProgramItem(itemId);
    }

    @PostMapping("/events/{eventId}/tickets")
    public EventDtos.TicketTypeResponse addTicket(@PathVariable Long eventId,
                                                  @Valid @RequestBody EventDtos.TicketTypeRequest request) {
        return eventService.addTicketType(eventId, request);
    }

    @PutMapping("/tickets/{ticketTypeId}")
    public EventDtos.TicketTypeResponse updateTicket(@PathVariable Long ticketTypeId,
                                                     @Valid @RequestBody EventDtos.TicketTypeRequest request) {
        return eventService.updateTicketType(ticketTypeId, request);
    }

    @DeleteMapping("/tickets/{ticketTypeId}")
    public void deleteTicket(@PathVariable Long ticketTypeId) {
        eventService.deleteTicketType(ticketTypeId);
    }

    @GetMapping("/orders")
    public List<OrderDtos.OrderResponse> allOrders() {
        return orderService.allOrders();
    }
}
