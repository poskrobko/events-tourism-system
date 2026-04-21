package com.example.library.controller;

import com.example.library.dto.EventDtos;
import com.example.library.dto.OrderDtos;
import com.example.library.service.EventService;
import com.example.library.service.OrderService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('EVENT_MANAGER')")
public class EventManagerController {
    private final EventService eventService;
    private final OrderService orderService;

    public EventManagerController(EventService eventService, OrderService orderService) {
        this.eventService = eventService;
        this.orderService = orderService;
    }

    @PostMapping("/events")
    public EventDtos.EventResponse createEvent(@Valid @RequestBody EventDtos.EventRequest request, Principal principal) {
        return eventService.createEventAsManager(request, principal.getName());
    }

    @PutMapping("/events/{eventId}")
    public EventDtos.EventResponse updateEvent(@PathVariable Long eventId, @Valid @RequestBody EventDtos.EventRequest request,
                                               Principal principal) {
        return eventService.updateEventAsManager(eventId, request, principal.getName());
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(@PathVariable Long eventId, Principal principal) {
        eventService.deleteEventAsManager(eventId, principal.getName());
    }

    @PostMapping("/events/{eventId}/program")
    public EventDtos.ProgramItemResponse addProgramItem(@PathVariable Long eventId,
                                                        @Valid @RequestBody EventDtos.ProgramItemRequest request,
                                                        Principal principal) {
        return eventService.addProgramItemAsManager(eventId, request, principal.getName());
    }

    @PutMapping("/program/{itemId}")
    public EventDtos.ProgramItemResponse updateProgramItem(@PathVariable Long itemId,
                                                           @Valid @RequestBody EventDtos.ProgramItemRequest request,
                                                           Principal principal) {
        return eventService.updateProgramItemAsManager(itemId, request, principal.getName());
    }

    @DeleteMapping("/program/{itemId}")
    public void deleteProgramItem(@PathVariable Long itemId, Principal principal) {
        eventService.deleteProgramItemAsManager(itemId, principal.getName());
    }

    @PostMapping("/events/{eventId}/tickets")
    public EventDtos.TicketTypeResponse addTicket(@PathVariable Long eventId,
                                                  @Valid @RequestBody EventDtos.TicketTypeRequest request,
                                                  Principal principal) {
        return eventService.addTicketTypeAsManager(eventId, request, principal.getName());
    }

    @PutMapping("/tickets/{ticketTypeId}")
    public EventDtos.TicketTypeResponse updateTicket(@PathVariable Long ticketTypeId,
                                                     @Valid @RequestBody EventDtos.TicketTypeRequest request,
                                                     Principal principal) {
        return eventService.updateTicketTypeAsManager(ticketTypeId, request, principal.getName());
    }

    @DeleteMapping("/tickets/{ticketTypeId}")
    public void deleteTicket(@PathVariable Long ticketTypeId, Principal principal) {
        eventService.deleteTicketTypeAsManager(ticketTypeId, principal.getName());
    }

    @GetMapping("/orders")
    public List<OrderDtos.OrderResponse> myEventOrders(Principal principal) {
        return orderService.ordersForManager(principal.getName());
    }
}
