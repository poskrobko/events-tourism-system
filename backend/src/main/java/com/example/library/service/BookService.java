package com.example.library.service;

import com.example.library.dto.BookDtos;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import com.example.library.repository.RatingRepository;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final RatingRepository ratingRepository;
    private final CurrentUserService currentUserService;

    public BookService(BookRepository bookRepository, RatingRepository ratingRepository, CurrentUserService currentUserService) {
        this.bookRepository = bookRepository;
        this.ratingRepository = ratingRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public Page<BookDtos.BookResponse> findAll(int page,
                                               int size,
                                               String sort,
                                               String direction,
                                               String query,
                                               String title,
                                               String genre,
                                               String author,
                                               String publisher,
                                               String language,
                                               String isbn,
                                               Integer yearFrom,
                                               Integer yearTo,
                                               String availability) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        Page<Book> books = bookRepository.search(
                normalize(query),
                normalize(title),
                normalize(author),
                normalize(genre),
                normalize(publisher),
                normalize(language),
                normalize(isbn),
                yearFrom,
                yearTo,
                normalizeAvailability(availability),
                pageable
        );

        return books.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BookDtos.CatalogMetaResponse getCatalogMeta() {
        List<String> authors = bookRepository.findDistinctAuthors();
        List<String> publishers = bookRepository.findDistinctPublishers();
        List<String> languages = bookRepository.findDistinctLanguages();

        Set<String> genres = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        for (String csv : bookRepository.findDistinctGenresCsv()) {
            if (csv == null || csv.isBlank()) {
                continue;
            }
            Arrays.stream(csv.split(","))
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .forEach(genres::add);
        }

        return new BookDtos.CatalogMetaResponse(authors, List.copyOf(genres), publishers, languages);
    }

    @Transactional(readOnly = true)
    public BookDtos.BookResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }



    @Transactional(readOnly = true)
    public BookDtos.BookDetailsResponse getDetails(Long id) {
        BookDtos.BookResponse book = getById(id);
        Double avg = ratingRepository.findAverageScoreByBookId(id);
        Long count = ratingRepository.countByBookId(id);
        Long currentUserId = currentUserService.getCurrentUserIdOrNull();
        Integer myRating = currentUserId == null
                ? null
                : ratingRepository.findByUserIdAndBookId(currentUserId, id).map(rating -> rating.getScore()).orElse(null);
        return new BookDtos.BookDetailsResponse(book, avg == null ? 0.0 : Math.round(avg * 100.0) / 100.0, count, myRating);
    }
    @Transactional(readOnly = true)
    public Book findEntityById(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
    }

    @Transactional
    public BookDtos.BookResponse create(BookDtos.BookRequest request) {
        Book book = new Book();
        mapRequest(book, request);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse createWithFiles(BookDtos.BookRequest request, MultipartFile file, MultipartFile cover) {
        Book book = new Book();
        mapRequest(book, request);
        applyFiles(book, file, cover);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse put(Long id, BookDtos.BookRequest request) {
        Book book = findEntityById(id);
        mapRequest(book, request);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse patch(Long id, BookDtos.BookRequest request) {
        Book book = findEntityById(id);
        if (request.title() != null) book.setTitle(request.title());
        if (request.author() != null) book.setAuthor(request.author());
        if (request.publicationYear() != null) book.setPublicationYear(request.publicationYear());
        if (request.genres() != null) book.setGenresCsv(String.join(",", request.genres()));
        if (request.copies() != null) {
            int delta = request.copies() - book.getTotalCopies();
            book.setTotalCopies(request.copies());
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + delta));
        }
        if (request.isbn() != null) book.setIsbn(normalize(request.isbn()));
        if (request.publisher() != null) book.setPublisher(normalize(request.publisher()));
        if (request.language() != null) book.setLanguage(normalize(request.language()));
        if (request.pageCount() != null) book.setPageCount(request.pageCount());
        if (request.description() != null) book.setDescription(normalize(request.description()));
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse uploadAssets(Long id, MultipartFile file, MultipartFile cover) {
        Book book = findEntityById(id);
        applyFiles(book, file, cover);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeAvailability(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        return switch (normalized) {
            case "all", "available", "unavailable" -> normalized;
            default -> null;
        };
    }

    private void mapRequest(Book book, BookDtos.BookRequest request) {
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setPublicationYear(request.publicationYear());
        book.setGenresCsv(request.genres() == null ? "" : String.join(",", request.genres()));
        book.setTotalCopies(request.copies());
        book.setAvailableCopies(request.copies());
        book.setIsbn(normalize(request.isbn()));
        book.setPublisher(normalize(request.publisher()));
        book.setLanguage(normalize(request.language()));
        book.setPageCount(request.pageCount());
        book.setDescription(normalize(request.description()));
    }

    private void applyFiles(Book book, MultipartFile file, MultipartFile cover) {
        try {
            if (file != null && !file.isEmpty()) {
                book.setFileName(file.getOriginalFilename());
                book.setFileContentType(file.getContentType());
                book.setFileData(file.getBytes());
            }
            if (cover != null && !cover.isEmpty()) {
                book.setCoverContentType(cover.getContentType());
                book.setCoverData(cover.getBytes());
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot process uploaded files", e);
        }
    }

    private BookDtos.BookResponse toResponse(Book b) {
        List<String> genres = b.getGenresCsv() == null || b.getGenresCsv().isBlank()
                ? List.of()
                : Arrays.stream(b.getGenresCsv().split(",")).map(String::trim).toList();
        return new BookDtos.BookResponse(
                b.getId(),
                b.getTitle(),
                b.getAuthor(),
                b.getPublicationYear(),
                genres,
                b.getTotalCopies(),
                b.getAvailableCopies(),
                b.getIsbn(),
                b.getPublisher(),
                b.getLanguage(),
                b.getPageCount(),
                b.getDescription(),
                b.getFileData() != null && b.getFileData().length > 0,
                b.getCoverData() != null && b.getCoverData().length > 0
        );
    }
}
