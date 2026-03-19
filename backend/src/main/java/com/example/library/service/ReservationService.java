package com.example.library.service;

import com.example.library.dto.ReservationDtos;
import com.example.library.model.Book;
import com.example.library.model.Reservation;
import com.example.library.model.ReservationStatus;
import com.example.library.model.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.ReservationRepository;
import com.example.library.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CurrentUserService currentUserService;

    public ReservationService(ReservationRepository reservationRepository,
                              UserRepository userRepository,
                              BookRepository bookRepository,
                              CurrentUserService currentUserService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public ReservationDtos.ReservationResponse create(ReservationDtos.CreateReservationRequest request) {
        currentUserService.requireSameUserOrAdmin(request.userId());

        User user = userRepository.findById(request.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findById(request.bookId()).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        boolean exists = reservationRepository.existsByUserIdAndBookIdAndStatusIn(
                user.getId(),
                book.getId(),
                List.of(ReservationStatus.WAITING, ReservationStatus.NOTIFIED)
        );
        if (exists) {
            throw new IllegalArgumentException("Active reservation already exists for this user/book");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setCreatedAt(Instant.now());
        if (book.getAvailableCopies() > 0) {
            reservation.setStatus(ReservationStatus.NOTIFIED);
            reservation.setNotifiedAt(Instant.now());
            reservation.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        } else {
            reservation.setStatus(ReservationStatus.WAITING);
        }
        return toDto(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationDtos.ReservationResponse cancel(Long reservationId, Long userId) {
        Reservation reservation = getReservationEntity(reservationId);
        boolean staffCancellation = currentUserService.isLibrarianOrAdmin();
        if (!staffCancellation) {
            currentUserService.requireSameUserOrAdmin(userId);
            if (!reservation.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Reservation does not belong to user");
            }
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.FULFILLED) {
            throw new IllegalStateException("Reservation already closed");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(Instant.now());
        return toDto(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationDtos.ReservationResponse> getCurrentUserReservations() {
        Long userId = currentUserService.getCurrentUserId();
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationDtos.ReservationResponse> getUserReservations(Long userId) {
        currentUserService.requireSameUserOrAdmin(userId);
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional
    public Reservation notifyFirstWaitingForBook(Long bookId) {
        return reservationRepository.findFirstByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.WAITING)
                .map(reservation -> {
                    reservation.setStatus(ReservationStatus.NOTIFIED);
                    reservation.setNotifiedAt(Instant.now());
                    reservation.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
                    return reservationRepository.save(reservation);
                })
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Reservation getReservationEntity(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
    }

    @Transactional
    public Reservation saveReservationEntity(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public ReservationDtos.ReservationResponse toDto(Reservation reservation) {
        return new ReservationDtos.ReservationResponse(
                reservation.getId(),
                reservation.getUser().getId(),
                reservation.getBook().getId(),
                reservation.getBook().getTitle(),
                reservation.getStatus(),
                reservation.getCreatedAt(),
                reservation.getNotifiedAt(),
                reservation.getExpiresAt(),
                reservation.getCancelledAt());
    }
}
