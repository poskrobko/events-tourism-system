package com.example.library.controller;

import com.example.library.dto.AdminDtos;
import com.example.library.dto.BookDtos;
import com.example.library.model.Loan;
import com.example.library.model.LoanStatus;
import com.example.library.model.Rating;
import com.example.library.model.RecommendationProfile;
import com.example.library.model.Reservation;
import com.example.library.model.ReservationStatus;
import com.example.library.model.Review;
import com.example.library.model.Role;
import com.example.library.model.User;
import com.example.library.repository.LoanRepository;
import com.example.library.repository.RatingRepository;
import com.example.library.repository.RecommendationProfileRepository;
import com.example.library.repository.ReservationRepository;
import com.example.library.repository.ReviewRepository;
import com.example.library.repository.UserRepository;
import com.example.library.service.BookService;
import com.example.library.service.LibrarianInvitationService;
import jakarta.validation.Valid;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;
    private final RecommendationProfileRepository recommendationProfileRepository;
    private final BookService bookService;
    private final LibrarianInvitationService librarianInvitationService;

    public AdminController(UserRepository userRepository,
                           LoanRepository loanRepository,
                           ReservationRepository reservationRepository,
                           RatingRepository ratingRepository,
                           ReviewRepository reviewRepository,
                           RecommendationProfileRepository recommendationProfileRepository,
                           BookService bookService,
                           LibrarianInvitationService librarianInvitationService) {
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
        this.reservationRepository = reservationRepository;
        this.ratingRepository = ratingRepository;
        this.reviewRepository = reviewRepository;
        this.recommendationProfileRepository = recommendationProfileRepository;
        this.bookService = bookService;
        this.librarianInvitationService = librarianInvitationService;
    }

    @GetMapping("/users")
    public Page<AdminDtos.AdminUserResponse> users(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size,
                                                   @RequestParam(required = false) String query,
                                                   @RequestParam(required = false) String role) {
        return userRepository.searchAdmin(query, parseRole(role), PageRequest.of(page, size)).map(this::toUserResponse);
    }

    @PatchMapping("/users/{id}")
    public AdminDtos.AdminUserResponse patchUser(@PathVariable Long id, @Valid @RequestBody AdminDtos.AdminUserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.email() != null && !request.email().isBlank()) {
            String normalizedEmail = request.email().trim();
            if (!normalizedEmail.equalsIgnoreCase(user.getEmail())) {
                userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
                    if (!existing.getId().equals(user.getId())) {
                        throw new IllegalArgumentException("Email already in use");
                    }
                });
            }
            user.setEmail(normalizedEmail);
        }
        if (request.nickname() != null && !request.nickname().isBlank()) {
            user.setNickname(request.nickname().trim());
        }
        if (request.roles() != null && !request.roles().isEmpty()) {
            user.setRoles(request.roles());
        }

        return toUserResponse(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    @PostMapping("/librarians/invite")
    public AdminDtos.InviteLibrarianResponse inviteLibrarian(@Valid @RequestBody AdminDtos.InviteLibrarianRequest request) {
        return librarianInvitationService.invite(request);
    }

    @GetMapping("/books")
    public Page<BookDtos.BookResponse> books(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size,
                                             @RequestParam(defaultValue = "title") String sort,
                                             @RequestParam(defaultValue = "asc") String direction,
                                             @RequestParam(required = false) String query,
                                             @RequestParam(required = false) String title,
                                             @RequestParam(required = false) String genre,
                                             @RequestParam(required = false) String author,
                                             @RequestParam(required = false) String publisher,
                                             @RequestParam(required = false) String language,
                                             @RequestParam(required = false) String isbn,
                                             @RequestParam(required = false) Integer yearFrom,
                                             @RequestParam(required = false) Integer yearTo,
                                             @RequestParam(required = false) String availability) {
        return bookService.findAll(page, size, sort, direction, query, title, genre, author, publisher, language, isbn, yearFrom, yearTo, availability);
    }

    @PatchMapping("/books/{id}")
    public BookDtos.BookResponse patchBook(@PathVariable Long id, @RequestBody BookDtos.BookRequest request) {
        return bookService.patch(id, request);
    }

    @DeleteMapping("/books/{id}")
    public void deleteBook(@PathVariable Long id) {
        bookService.delete(id);
    }

    @GetMapping("/loans")
    public Page<AdminDtos.AdminLoanResponse> loans(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size,
                                                   @RequestParam(required = false) String userQuery,
                                                   @RequestParam(required = false) String bookQuery,
                                                   @RequestParam(required = false) String status) {
        return loanRepository.searchAdmin(userQuery, bookQuery, parseLoanStatus(status), PageRequest.of(page, size)).map(this::toLoanResponse);
    }

    @GetMapping("/reservations")
    public Page<AdminDtos.AdminReservationResponse> reservations(@RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "20") int size,
                                                                 @RequestParam(required = false) String userQuery,
                                                                 @RequestParam(required = false) String bookQuery,
                                                                 @RequestParam(required = false) String status) {
        return reservationRepository.searchAdmin(userQuery, bookQuery, parseReservationStatus(status), PageRequest.of(page, size))
                .map(this::toReservationResponse);
    }

    @GetMapping("/ratings")
    public Page<AdminDtos.AdminRatingResponse> ratings(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size,
                                                       @RequestParam(required = false) String userQuery,
                                                       @RequestParam(required = false) String bookQuery,
                                                       @RequestParam(required = false) Integer score) {
        return ratingRepository.searchAdmin(userQuery, bookQuery, score, PageRequest.of(page, size))
                .map(this::toRatingResponse);
    }

    @GetMapping("/reviews")
    public Page<AdminDtos.AdminReviewResponse> reviews(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size,
                                                       @RequestParam(required = false) String userQuery,
                                                       @RequestParam(required = false) String bookQuery) {
        return reviewRepository.searchAdmin(userQuery, bookQuery, PageRequest.of(page, size)).map(this::toReviewResponse);
    }

    @GetMapping("/recommendation-profiles")
    public Page<AdminDtos.AdminRecommendationProfileResponse> recommendationProfiles(@RequestParam(defaultValue = "0") int page,
                                                                                      @RequestParam(defaultValue = "20") int size,
                                                                                      @RequestParam(required = false) String userQuery) {
        return recommendationProfileRepository.searchAdmin(userQuery, PageRequest.of(page, size)).map(this::toRecommendationProfileResponse);
    }

    private AdminDtos.AdminUserResponse toUserResponse(User user) {
        return new AdminDtos.AdminUserResponse(user.getId(), user.getEmail(), user.getNickname(), user.getRoles());
    }

    private AdminDtos.AdminLoanResponse toLoanResponse(Loan loan) {
        return new AdminDtos.AdminLoanResponse(
                loan.getId(),
                loan.getUser().getId(),
                loan.getUser().getEmail(),
                loan.getBook().getId(),
                loan.getBook().getTitle(),
                loan.getStatus(),
                loan.getBorrowedAt(),
                loan.getDueDate(),
                loan.getReturnedAt()
        );
    }

    private AdminDtos.AdminReservationResponse toReservationResponse(Reservation reservation) {
        return new AdminDtos.AdminReservationResponse(
                reservation.getId(),
                reservation.getUser().getId(),
                reservation.getUser().getEmail(),
                reservation.getBook().getId(),
                reservation.getBook().getTitle(),
                reservation.getStatus(),
                reservation.getCreatedAt(),
                reservation.getNotifiedAt(),
                reservation.getExpiresAt(),
                reservation.getCancelledAt(),
                null,
                null,
                null,
                null,
                null
        );
    }

    private AdminDtos.AdminRatingResponse toRatingResponse(Rating rating) {
        return new AdminDtos.AdminRatingResponse(
                rating.getId(),
                rating.getUser().getId(),
                rating.getUser().getEmail(),
                rating.getBook().getId(),
                rating.getBook().getTitle(),
                rating.getScore()
        );
    }

    private AdminDtos.AdminReviewResponse toReviewResponse(Review review) {
        return new AdminDtos.AdminReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getEmail(),
                review.getBook().getId(),
                review.getBook().getTitle(),
                review.getText(),
                review.getCreatedAt()
        );
    }

    private AdminDtos.AdminRecommendationProfileResponse toRecommendationProfileResponse(RecommendationProfile profile) {
        return new AdminDtos.AdminRecommendationProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getEmail(),
                profile.getPreferredGenresCsv(),
                profile.getFavoriteAuthorsCsv()
        );
    }

    private Role parseRole(String value) {
        if (value == null || value.isBlank()) return null;
        return Role.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    private LoanStatus parseLoanStatus(String value) {
        if (value == null || value.isBlank()) return null;
        return LoanStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    private ReservationStatus parseReservationStatus(String value) {
        if (value == null || value.isBlank()) return null;
        return ReservationStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
