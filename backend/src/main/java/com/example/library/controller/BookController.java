package com.example.library.controller;

import com.example.library.dto.BookDtos;
import com.example.library.model.Book;
import com.example.library.service.BookService;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {
    private static final byte[] DEFAULT_COVER = (
            "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'>"
                    + "<rect width='100%' height='100%' fill='#e2e8f0'/>"
                    + "<text x='50%' y='50%' font-size='22' dominant-baseline='middle' text-anchor='middle' fill='#334155'>No cover</text>"
                    + "</svg>").getBytes(StandardCharsets.UTF_8);

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public Page<BookDtos.BookResponse> list(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(defaultValue = "title") String sort,
                                            @RequestParam(defaultValue = "asc") String direction,
                                            @RequestParam(required = false) String query,
                                            @RequestParam(required = false) String title,
                                            @RequestParam(required = false) String genre,
                                            @RequestParam(required = false) String author,
                                            @RequestParam(required = false) Integer yearFrom,
                                            @RequestParam(required = false) Integer yearTo,
                                            @RequestParam(required = false) String availability) {
        return bookService.findAll(page, size, sort, direction, query, title, genre, author, yearFrom, yearTo, availability);
    }

    @GetMapping("/meta")
    public BookDtos.CatalogMetaResponse meta() { return bookService.getCatalogMeta(); }

    @GetMapping("/{id}")
    public BookDtos.BookResponse get(@PathVariable Long id) { return bookService.getById(id); }

    @PostMapping
    public BookDtos.BookResponse create(@Valid @RequestBody BookDtos.BookRequest request) { return bookService.create(request); }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BookDtos.BookResponse createWithUpload(@RequestParam String title,
                                                  @RequestParam String author,
                                                  @RequestParam Integer publicationYear,
                                                  @RequestParam Integer copies,
                                                  @RequestParam(required = false) List<String> genres,
                                                  @RequestParam(required = false) String isbn,
                                                  @RequestParam(required = false) String publisher,
                                                  @RequestParam(required = false) String language,
                                                  @RequestParam(required = false) Integer pageCount,
                                                  @RequestParam(required = false) String description,
                                                  @RequestPart(required = false) MultipartFile file,
                                                  @RequestPart(required = false) MultipartFile cover) {
        return bookService.createWithFiles(
                new BookDtos.BookRequest(title, author, publicationYear, genres, copies, isbn, publisher, language, pageCount, description),
                file,
                cover
        );
    }

    @PutMapping("/{id}")
    public BookDtos.BookResponse put(@PathVariable Long id, @Valid @RequestBody BookDtos.BookRequest request) { return bookService.put(id, request); }

    @PatchMapping("/{id}")
    public BookDtos.BookResponse patch(@PathVariable Long id, @RequestBody BookDtos.BookRequest request) { return bookService.patch(id, request); }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BookDtos.BookResponse uploadAssets(@PathVariable Long id,
                                              @RequestPart(required = false) MultipartFile file,
                                              @RequestPart(required = false) MultipartFile cover) {
        return bookService.uploadAssets(id, file, cover);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Book book = bookService.findEntityById(id);
        if (book.getFileData() == null || book.getFileData().length == 0) {
            throw new IllegalArgumentException("Book file not found");
        }

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(book.getFileName() == null ? "book.pdf" : book.getFileName())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(book.getFileContentType() == null ? "application/pdf" : book.getFileContentType()))
                .body(book.getFileData());
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<byte[]> cover(@PathVariable Long id) {
        Book book = bookService.findEntityById(id);
        if (book.getCoverData() == null || book.getCoverData().length == 0) {
            return ResponseEntity.ok().contentType(MediaType.valueOf("image/svg+xml")).body(DEFAULT_COVER);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(book.getCoverContentType() == null ? "image/jpeg" : book.getCoverContentType()))
                .body(book.getCoverData());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { bookService.delete(id); }
}
