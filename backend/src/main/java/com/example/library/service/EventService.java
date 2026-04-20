package com.example.library.service;

import com.example.library.dto.EventDtos;
import com.example.library.model.Event;
import com.example.library.model.EventProgramItem;
import com.example.library.model.TicketType;
import com.example.library.repository.EventProgramItemRepository;
import com.example.library.repository.EventRepository;
import com.example.library.repository.TicketTypeRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final EventProgramItemRepository programRepository;
    private final TicketTypeRepository ticketTypeRepository;

    public EventService(EventRepository eventRepository, EventProgramItemRepository programRepository,
                        TicketTypeRepository ticketTypeRepository) {
        this.eventRepository = eventRepository;
        this.programRepository = programRepository;
        this.ticketTypeRepository = ticketTypeRepository;
    }

    public List<EventDtos.EventResponse> listEvents(LocalDateTime dateFrom, LocalDateTime dateTo, String city,
                                                    BigDecimal minPrice, BigDecimal maxPrice) {
        return eventRepository.findByFilters(dateFrom, dateTo, city, minPrice, maxPrice)
                .stream().map(this::toResponse).toList();
    }

    public EventDtos.EventDetailsResponse getEventDetails(Long eventId) {
        Event event = getEvent(eventId);
        var eventResponse = toResponse(event);
        var program = programRepository.findByEventIdOrderByStartDateTimeAsc(eventId).stream().map(this::toProgramResponse).toList();
        var tickets = ticketTypeRepository.findByEventIdOrderByPriceAsc(eventId).stream().map(this::toTicketResponse).toList();
        return new EventDtos.EventDetailsResponse(eventResponse, program, tickets, buildGoogleCalendarUrl(event));
    }

    @Transactional
    public EventDtos.EventResponse createEvent(EventDtos.EventRequest request) {
        Event event = new Event();
        apply(event, request);
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventDtos.EventResponse updateEvent(Long eventId, EventDtos.EventRequest request) {
        Event event = getEvent(eventId);
        apply(event, request);
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }

    @Transactional
    public EventDtos.ProgramItemResponse addProgramItem(Long eventId, EventDtos.ProgramItemRequest request) {
        EventProgramItem item = new EventProgramItem();
        item.setEvent(getEvent(eventId));
        item.setTitle(request.title());
        item.setStartDateTime(request.startDateTime());
        item.setEndDateTime(request.endDateTime());
        item.setDescription(request.description());
        return toProgramResponse(programRepository.save(item));
    }

    public List<EventDtos.ProgramItemResponse> listProgram(Long eventId) {
        return programRepository.findByEventIdOrderByStartDateTimeAsc(eventId).stream().map(this::toProgramResponse).toList();
    }

    @Transactional
    public EventDtos.ProgramItemResponse updateProgramItem(Long itemId, EventDtos.ProgramItemRequest request) {
        EventProgramItem item = programRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Program item not found"));
        item.setTitle(request.title());
        item.setStartDateTime(request.startDateTime());
        item.setEndDateTime(request.endDateTime());
        item.setDescription(request.description());
        return toProgramResponse(programRepository.save(item));
    }

    @Transactional
    public void deleteProgramItem(Long itemId) {
        programRepository.deleteById(itemId);
    }

    @Transactional
    public EventDtos.TicketTypeResponse addTicketType(Long eventId, EventDtos.TicketTypeRequest request) {
        TicketType tt = new TicketType();
        tt.setEvent(getEvent(eventId));
        tt.setName(request.name());
        tt.setPrice(request.price());
        tt.setQuantityTotal(request.quantityTotal());
        tt.setQuantitySold(0);
        return toTicketResponse(ticketTypeRepository.save(tt));
    }

    public List<EventDtos.TicketTypeResponse> listTicketTypes(Long eventId) {
        return ticketTypeRepository.findByEventIdOrderByPriceAsc(eventId).stream().map(this::toTicketResponse).toList();
    }

    @Transactional
    public EventDtos.TicketTypeResponse updateTicketType(Long ticketTypeId, EventDtos.TicketTypeRequest request) {
        TicketType tt = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
        tt.setName(request.name());
        tt.setPrice(request.price());
        if (request.quantityTotal() < tt.getQuantitySold()) {
            throw new IllegalArgumentException("quantityTotal cannot be less than quantitySold");
        }
        tt.setQuantityTotal(request.quantityTotal());
        return toTicketResponse(ticketTypeRepository.save(tt));
    }

    @Transactional
    public void deleteTicketType(Long ticketTypeId) {
        ticketTypeRepository.deleteById(ticketTypeId);
    }

    public Event getEvent(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    public EventDtos.EventResponse toResponse(Event e) {
        BigDecimal minPrice = ticketTypeRepository.findMinPriceByEventId(e.getId()).orElse(null);
        return new EventDtos.EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getCity(), e.getVenue(),
                e.getLatitude(), e.getLongitude(), e.getMapUrl(), e.getStartDateTime(), e.getEndDateTime(), minPrice
        );
    }

    private EventDtos.ProgramItemResponse toProgramResponse(EventProgramItem item) {
        return new EventDtos.ProgramItemResponse(
                item.getId(), item.getEvent().getId(), item.getTitle(), item.getStartDateTime(), item.getEndDateTime(), item.getDescription()
        );
    }

    public EventDtos.TicketTypeResponse toTicketResponse(TicketType tt) {
        return new EventDtos.TicketTypeResponse(
                tt.getId(), tt.getEvent().getId(), tt.getName(), tt.getPrice(), tt.getQuantityTotal(), tt.getQuantitySold(),
                tt.getQuantityTotal() - tt.getQuantitySold()
        );
    }

    private String buildGoogleCalendarUrl(Event event) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        String start = event.getStartDateTime().atOffset(ZoneOffset.UTC).format(f);
        String end = event.getEndDateTime().atOffset(ZoneOffset.UTC).format(f);
        return "https://calendar.google.com/calendar/render?action=TEMPLATE"
                + "&text=" + enc(event.getTitle())
                + "&dates=" + start + "/" + end
                + "&details=" + enc(event.getDescription())
                + "&location=" + enc(event.getVenue() + ", " + event.getCity());
    }

    private String enc(String input) {
        return URLEncoder.encode(input, StandardCharsets.UTF_8);
    }

    private void apply(Event event, EventDtos.EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCity(request.city());
        event.setVenue(request.venue());
        event.setLatitude(request.latitude());
        event.setLongitude(request.longitude());
        event.setMapUrl(request.mapUrl());
        event.setStartDateTime(request.startDateTime());
        event.setEndDateTime(request.endDateTime());
    }
}
