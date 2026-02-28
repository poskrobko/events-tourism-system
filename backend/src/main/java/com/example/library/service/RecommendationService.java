package com.example.library.service;

import com.example.library.dto.BookDtos;
import com.example.library.model.RecommendationProfile;
import com.example.library.repository.BookRepository;
import com.example.library.repository.RecommendationProfileRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationService {
    private final RecommendationProfileRepository profileRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;
    private final CurrentUserService currentUserService;

    public RecommendationService(RecommendationProfileRepository profileRepository,
                                 BookRepository bookRepository,
                                 BookService bookService,
                                 CurrentUserService currentUserService) {
        this.profileRepository = profileRepository;
        this.bookRepository = bookRepository;
        this.bookService = bookService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public Page<BookDtos.BookResponse> getRecommendations(Long userId, int page, int size) {
        currentUserService.requireSameUserOrAdmin(userId);

        RecommendationProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return bookRepository.findAll(PageRequest.of(page, size)).map(book -> bookService.getById(book.getId()));
        }

        List<String> genres = profile.getPreferredGenresCsv() == null ? List.of() : Arrays.stream(profile.getPreferredGenresCsv().split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        String primaryGenre = genres.isEmpty() ? "" : genres.getFirst();

        List<String> authors = profile.getFavoriteAuthorsCsv() == null ? List.of() : Arrays.stream(profile.getFavoriteAuthorsCsv().split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        String primaryAuthor = authors.isEmpty() ? "" : authors.getFirst();

        if (primaryGenre.isBlank() && primaryAuthor.isBlank()) {
            return bookRepository.findAll(PageRequest.of(page, size)).map(book -> bookService.getById(book.getId()));
        }

        return bookRepository.findByGenresCsvContainingIgnoreCaseAndAuthorContainingIgnoreCase(primaryGenre, primaryAuthor, PageRequest.of(page, size))
                .map(book -> bookService.getById(book.getId()));
    }
}
