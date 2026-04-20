package com.example.library.controller;

import com.example.library.dto.EventDtos;
import com.example.library.service.EventService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventDtos.EventResponse> listEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return eventService.listEvents(dateFrom, dateTo, city, minPrice, maxPrice);
    }

    @GetMapping("/{eventId}")
    public EventDtos.EventDetailsResponse getEventDetails(@PathVariable Long eventId) {
        return eventService.getEventDetails(eventId);
    }

    @GetMapping("/{eventId}/program")
    public List<EventDtos.ProgramItemResponse> program(@PathVariable Long eventId) {
        return eventService.listProgram(eventId);
    }

    @GetMapping("/{eventId}/tickets")
    public List<EventDtos.TicketTypeResponse> tickets(@PathVariable Long eventId) {
        return eventService.listTicketTypes(eventId);
    }
}
