package com.example.library.controller;

import com.example.library.dto.BookDtos;
import com.example.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public Page<BookDtos.BookResponse> list(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(defaultValue = "title") String sort,
                                            @RequestParam(defaultValue = "asc") String direction,
                                            @RequestParam(required = false) String genre,
                                            @RequestParam(required = false) String author) {
        return bookService.findAll(page, size, sort, direction, genre, author);
    }

    @GetMapping("/meta")
    public BookDtos.CatalogMetaResponse meta() { return bookService.getCatalogMeta(); }

    @GetMapping("/{id}")
    public BookDtos.BookResponse get(@PathVariable Long id) { return bookService.getById(id); }

    @PostMapping
    public BookDtos.BookResponse create(@Valid @RequestBody BookDtos.BookRequest request) { return bookService.create(request); }

    @PutMapping("/{id}")
    public BookDtos.BookResponse put(@PathVariable Long id, @Valid @RequestBody BookDtos.BookRequest request) { return bookService.put(id, request); }

    @PatchMapping("/{id}")
    public BookDtos.BookResponse patch(@PathVariable Long id, @RequestBody BookDtos.BookRequest request) { return bookService.patch(id, request); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { bookService.delete(id); }
}
