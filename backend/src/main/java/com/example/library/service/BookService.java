package com.example.library.service;

import com.example.library.dto.BookDtos;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
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

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public Page<BookDtos.BookResponse> findAll(int page, int size, String sort, String direction, String genre, String author) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<Book> books = (genre != null || author != null)
                ? bookRepository.findByGenresCsvContainingIgnoreCaseAndAuthorContainingIgnoreCase(
                        genre == null ? "" : genre,
                        author == null ? "" : author,
                        pageable)
                : bookRepository.findAll(pageable);
        return books.map(this::toResponse);
    }


    @Transactional(readOnly = true)
    public BookDtos.CatalogMetaResponse getCatalogMeta() {
        List<String> authors = bookRepository.findDistinctAuthors();

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

        return new BookDtos.CatalogMetaResponse(authors, List.copyOf(genres));
    }

    @Transactional(readOnly = true)
    public BookDtos.BookResponse getById(Long id) {
        return toResponse(bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found")));
    }

    @Transactional
    public BookDtos.BookResponse create(BookDtos.BookRequest request) {
        Book book = new Book();
        mapRequest(book, request);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse put(Long id, BookDtos.BookRequest request) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        mapRequest(book, request);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse patch(Long id, BookDtos.BookRequest request) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (request.title() != null) book.setTitle(request.title());
        if (request.author() != null) book.setAuthor(request.author());
        if (request.publicationYear() != null) book.setPublicationYear(request.publicationYear());
        if (request.genres() != null) book.setGenresCsv(String.join(",", request.genres()));
        if (request.copies() != null) {
            int delta = request.copies() - book.getTotalCopies();
            book.setTotalCopies(request.copies());
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + delta));
        }
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    private void mapRequest(Book book, BookDtos.BookRequest request) {
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setPublicationYear(request.publicationYear());
        book.setGenresCsv(request.genres() == null ? "" : String.join(",", request.genres()));
        book.setTotalCopies(request.copies());
        book.setAvailableCopies(request.copies());
    }

    private BookDtos.BookResponse toResponse(Book b) {
        List<String> genres = b.getGenresCsv() == null || b.getGenresCsv().isBlank()
                ? List.of()
                : Arrays.stream(b.getGenresCsv().split(",")).map(String::trim).toList();
        return new BookDtos.BookResponse(b.getId(), b.getTitle(), b.getAuthor(), b.getPublicationYear(), genres, b.getTotalCopies(), b.getAvailableCopies());
    }
}
