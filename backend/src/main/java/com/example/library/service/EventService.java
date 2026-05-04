package com.example.library.service;

import com.example.library.dto.EventDtos;
import com.example.library.model.Event;
import com.example.library.model.EventProgramItem;
import com.example.library.model.TicketType;
import com.example.library.repository.UserRepository;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final EventProgramItemRepository programRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, EventProgramItemRepository programRepository,
                        TicketTypeRepository ticketTypeRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.programRepository = programRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.userRepository = userRepository;
    }

    public List<EventDtos.EventResponse> listEvents(LocalDateTime dateFrom, LocalDateTime dateTo, String city,
                                                    BigDecimal minPrice, BigDecimal maxPrice, String ticketType) {
        return eventRepository.findAllByOrderByStartDateTimeAsc(PageRequest.of(0, 12)).stream()
                .filter(event -> dateFrom == null || !event.getStartDateTime().isBefore(dateFrom))
                .filter(event -> dateTo == null || !event.getStartDateTime().isAfter(dateTo))
                .filter(event -> city == null || event.getCity().equalsIgnoreCase(city))
                .filter(event -> matchesTicketFilters(event.getId(), minPrice, maxPrice, ticketType))
                .map(this::toResponse)
                .toList();
    }

    public List<EventDtos.EventResponse> listEventsForManager(String managerEmail) {
        return eventRepository.findByCreatedByEmailOrderByStartDateTimeAsc(managerEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    private boolean matchesTicketFilters(Long eventId, BigDecimal minPrice, BigDecimal maxPrice, String ticketType) {
        if (minPrice == null && maxPrice == null && (ticketType == null || ticketType.isBlank())) {
            return true;
        }

        return ticketTypeRepository.findByEventIdOrderByPriceAsc(eventId).stream()
                .anyMatch(ticket -> (minPrice == null || ticket.getPrice().compareTo(minPrice) >= 0)
                        && (maxPrice == null || ticket.getPrice().compareTo(maxPrice) <= 0)
                        && (ticketType == null || ticketType.isBlank() || ticket.getName().equalsIgnoreCase(ticketType)));
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
    public EventDtos.EventResponse createEventAsManager(EventDtos.EventRequest request, String managerEmail) {
        Event event = new Event();
        apply(event, request);
        event.setCreatedBy(userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventDtos.EventResponse updateEvent(Long eventId, EventDtos.EventRequest request) {
        Event event = getEvent(eventId);
        apply(event, request);
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventDtos.EventResponse updateEventAsManager(Long eventId, EventDtos.EventRequest request, String managerEmail) {
        Event event = getManagerEvent(eventId, managerEmail);
        apply(event, request);
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }

    @Transactional
    public void deleteEventAsManager(Long eventId, String managerEmail) {
        Event event = getManagerEvent(eventId, managerEmail);
        eventRepository.delete(event);
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

    @Transactional
    public EventDtos.ProgramItemResponse addProgramItemAsManager(Long eventId, EventDtos.ProgramItemRequest request, String managerEmail) {
        EventProgramItem item = new EventProgramItem();
        item.setEvent(getManagerEvent(eventId, managerEmail));
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
    public EventDtos.ProgramItemResponse updateProgramItemAsManager(Long itemId, EventDtos.ProgramItemRequest request, String managerEmail) {
        EventProgramItem item = programRepository.findByIdAndEventCreatedByEmail(itemId, managerEmail)
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
    public void deleteProgramItemAsManager(Long itemId, String managerEmail) {
        EventProgramItem item = programRepository.findByIdAndEventCreatedByEmail(itemId, managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Program item not found"));
        programRepository.delete(item);
    }

    @Transactional
    public EventDtos.TicketTypeResponse addTicketType(Long eventId, EventDtos.TicketTypeRequest request) {
        TicketType tt = new TicketType();
        tt.setEvent(getEvent(eventId));
        tt.setName(request.name());
        tt.setPrice(request.price());
        tt.setQuantityTotal(request.quantityTotal());
        tt.setQuantitySold(0);
        TicketType saved = ticketTypeRepository.save(tt);
        refreshEventAvailableTickets(eventId);
        return toTicketResponse(saved);
    }

    @Transactional
    public EventDtos.TicketTypeResponse addTicketTypeAsManager(Long eventId, EventDtos.TicketTypeRequest request, String managerEmail) {
        TicketType tt = new TicketType();
        tt.setEvent(getManagerEvent(eventId, managerEmail));
        tt.setName(request.name());
        tt.setPrice(request.price());
        tt.setQuantityTotal(request.quantityTotal());
        tt.setQuantitySold(0);
        TicketType saved = ticketTypeRepository.save(tt);
        refreshEventAvailableTickets(eventId);
        return toTicketResponse(saved);
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
        TicketType saved = ticketTypeRepository.save(tt);
        refreshEventAvailableTickets(saved.getEvent().getId());
        return toTicketResponse(saved);
    }

    @Transactional
    public EventDtos.TicketTypeResponse updateTicketTypeAsManager(Long ticketTypeId, EventDtos.TicketTypeRequest request,
                                                                  String managerEmail) {
        TicketType tt = ticketTypeRepository.findByIdAndEventCreatedByEmail(ticketTypeId, managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
        tt.setName(request.name());
        tt.setPrice(request.price());
        if (request.quantityTotal() < tt.getQuantitySold()) {
            throw new IllegalArgumentException("quantityTotal cannot be less than quantitySold");
        }
        tt.setQuantityTotal(request.quantityTotal());
        TicketType saved = ticketTypeRepository.save(tt);
        refreshEventAvailableTickets(saved.getEvent().getId());
        return toTicketResponse(saved);
    }

    @Transactional
    public void deleteTicketType(Long ticketTypeId) {
        TicketType tt = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
        Long eventId = tt.getEvent().getId();
        ticketTypeRepository.delete(tt);
        refreshEventAvailableTickets(eventId);
    }

    @Transactional
    public void deleteTicketTypeAsManager(Long ticketTypeId, String managerEmail) {
        TicketType tt = ticketTypeRepository.findByIdAndEventCreatedByEmail(ticketTypeId, managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Ticket type not found"));
        Long eventId = tt.getEvent().getId();
        ticketTypeRepository.delete(tt);
        refreshEventAvailableTickets(eventId);
    }

    public Event getEvent(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private Event getManagerEvent(Long id, String managerEmail) {
        return eventRepository.findByIdAndCreatedByEmail(id, managerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    public EventDtos.EventResponse toResponse(Event e) {
        BigDecimal minPrice = ticketTypeRepository.findMinPriceByEventId(e.getId()).orElse(null);
        return new EventDtos.EventResponse(
                e.getId(), e.getTitle(), e.getDescription(), e.getCity(), e.getVenue(),
                e.getLatitude(), e.getLongitude(), e.getMapUrl(), e.getImageUrl(), e.getStartDateTime(), e.getEndDateTime(), minPrice,
                e.getAvailableTickets(),
                e.getCreatedBy() != null ? e.getCreatedBy().getEmail() : null,
                e.getCreatedBy() != null ? e.getCreatedBy().getFullName() : null
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

    public void refreshEventAvailableTickets(Long eventId) {
        Event event = getEvent(eventId);
        Integer available = ticketTypeRepository.sumAvailableByEventId(eventId);
        event.setAvailableTickets(available == null ? 0 : available);
        eventRepository.save(event);
    }

    private void apply(Event event, EventDtos.EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCity(request.city());
        event.setVenue(request.venue());
        event.setLatitude(request.latitude());
        event.setLongitude(request.longitude());
        event.setMapUrl(request.mapUrl());
        event.setImageUrl(request.imageUrl());
        event.setStartDateTime(request.startDateTime());
        event.setEndDateTime(request.endDateTime());
    }
}
