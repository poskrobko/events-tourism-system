package com.example.library.service;

import com.example.library.dto.FeedbackDtos;
import com.example.library.model.Book;
import com.example.library.model.Rating;
import com.example.library.model.RecommendationProfile;
import com.example.library.model.Review;
import com.example.library.model.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.RatingRepository;
import com.example.library.repository.RecommendationProfileRepository;
import com.example.library.repository.ReviewRepository;
import com.example.library.repository.UserRepository;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final RecommendationProfileRepository profileRepository;
    private final CurrentUserService currentUserService;

    public FeedbackService(RatingRepository ratingRepository,
                           ReviewRepository reviewRepository,
                           BookRepository bookRepository,
                           UserRepository userRepository,
                           RecommendationProfileRepository profileRepository,
                           CurrentUserService currentUserService) {
        this.ratingRepository = ratingRepository;
        this.reviewRepository = reviewRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public void createRating(Long bookId, FeedbackDtos.RatingRequest request) {
        currentUserService.requireSameUserOrAdmin(request.userId());

        User user = userRepository.findById(request.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        Rating rating = ratingRepository.findByUserIdAndBookId(request.userId(), bookId).orElseGet(Rating::new);
        rating.setUser(user);
        rating.setBook(book);
        rating.setScore(request.score());
        ratingRepository.save(rating);
    }

    @Transactional
    public void updateMyRating(Long bookId, FeedbackDtos.RatingRequest request) {
        createRating(bookId, request);
    }

    @Transactional
    public void createOrUpdateReview(Long bookId, FeedbackDtos.ReviewRequest request) {
        currentUserService.requireSameUserOrAdmin(request.userId());

        User user = userRepository.findById(request.userId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        Review review;
        if (request.reviewId() != null) {
            review = reviewRepository.findById(request.reviewId())
                    .orElseThrow(() -> new IllegalArgumentException("Review not found"));
            if (!review.getUser().getId().equals(user.getId()) || !review.getBook().getId().equals(book.getId())) {
                throw new IllegalArgumentException("Review does not belong to user/book");
            }
        } else {
            review = new Review();
            review.setUser(user);
            review.setBook(book);
            review.setCreatedAt(Instant.now());
        }
        review.setText(request.text());
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public Page<Review> getReviews(Long bookId, int page, int size) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Review getCurrentUserReview(Long bookId) {
        Long userId = currentUserService.getCurrentUserId();
        return reviewRepository.findFirstByBookIdAndUserIdOrderByCreatedAtDesc(bookId, userId).orElse(null);
    }

    @Transactional
    public void updatePreferences(Long userId, FeedbackDtos.PreferencesRequest request) {
        currentUserService.requireSameUserOrAdmin(userId);

        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        RecommendationProfile profile = profileRepository.findByUserId(userId).orElseGet(RecommendationProfile::new);
        profile.setUser(user);
        profile.setPreferredGenresCsv(request.preferredGenresCsv());
        profile.setFavoriteAuthorsCsv(request.favoriteAuthorsCsv());
        profileRepository.save(profile);
    }
}
