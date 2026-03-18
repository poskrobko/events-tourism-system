package com.example.library.controller;

import com.example.library.dto.BookDtos;
import com.example.library.model.Book;
import com.example.library.service.BookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/books")
@Validated
public class BookController {
    private static final byte[] DEFAULT_COVER = (
            "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='640' viewBox='0 0 420 640'>"
                    + "<defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#1e293b'/><stop offset='100%' stop-color='#7c3aed'/></linearGradient></defs>"
                    + "<rect width='420' height='640' rx='28' fill='url(#bg)'/>"
                    + "<rect x='28' y='28' width='364' height='584' rx='24' fill='rgba(15,23,42,0.18)'/>"
                    + "<text x='42' y='92' font-size='18' letter-spacing='3' fill='#f8fafc'>LIBRARY EDITION</text>"
                    + "<text x='42' y='170' font-size='34' fill='#ffffff'>Curated Selection</text>"
                    + "<text x='42' y='470' font-size='22' fill='#e2e8f0'>Upload a custom cover</text>"
                    + "<text x='42' y='565' font-size='16' fill='#f8fafc'>CATALOG</text>"
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

    @GetMapping("/{id}/details")
    public BookDtos.BookDetailsResponse details(@PathVariable Long id) { return bookService.getDetails(id); }

    @PostMapping
    public BookDtos.BookResponse create(@Valid @RequestBody BookDtos.BookRequest request) { return bookService.create(request); }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BookDtos.BookResponse createWithUpload(@RequestParam @NotBlank(message = "Укажите название книги") @Size(max = 255, message = "Название не должно превышать 255 символов") String title,
                                                  @RequestParam @NotBlank(message = "Укажите автора") @Size(max = 255, message = "Имя автора не должно превышать 255 символов") String author,
                                                  @RequestParam @Min(value = 1450, message = "Год публикации должен быть не раньше 1450") @Max(value = 2100, message = "Год публикации должен быть не позже 2100") Integer publicationYear,
                                                  @RequestParam @Min(value = 1, message = "Количество копий должно быть не меньше 1") @Max(value = 1000, message = "Количество копий должно быть не больше 1000") Integer copies,
                                                  @RequestParam(required = false) List<String> genres,
                                                  @RequestParam(required = false) @Pattern(regexp = "^(?:97[89])?\\d{9}[\\dXx]$", message = "Введите корректный ISBN-10 или ISBN-13") String isbn,
                                                  @RequestParam(required = false) @Size(max = 255, message = "Название издательства не должно превышать 255 символов") String publisher,
                                                  @RequestParam(required = false) @Size(max = 100, message = "Название языка не должно превышать 100 символов") String language,
                                                  @RequestParam(required = false) @Min(value = 1, message = "Количество страниц должно быть не меньше 1") @Max(value = 10000, message = "Количество страниц должно быть не больше 10000") Integer pageCount,
                                                  @RequestParam(required = false) @Size(max = 2000, message = "Описание не должно превышать 2000 символов") String description,
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
