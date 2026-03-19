package com.example.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public class BookDtos {
    public record BookRequest(
            @NotBlank(message = "Укажите название книги")
            @Size(max = 255, message = "Название не должно превышать 255 символов") String title,
            @NotBlank(message = "Укажите автора")
            @Size(max = 255, message = "Имя автора не должно превышать 255 символов") String author,
            @NotNull(message = "Укажите год публикации")
            @Min(value = 1450, message = "Год публикации должен быть не раньше 1450")
            @Max(value = 2100, message = "Год публикации должен быть не позже 2100") Integer publicationYear,
            List<String> genres,
            @NotNull(message = "Укажите количество копий")
            @Min(value = 1, message = "Количество копий должно быть не меньше 1")
            @Max(value = 1000, message = "Количество копий должно быть не больше 1000") Integer copies,
            @Pattern(regexp = "^(?:97[89])?\\d{9}[\\dXx]$", message = "Введите корректный ISBN-10 или ISBN-13") String isbn,
            @Size(max = 255, message = "Название издательства не должно превышать 255 символов") String publisher,
            @Size(max = 100, message = "Название языка не должно превышать 100 символов") String language,
            @Min(value = 1, message = "Количество страниц должно быть не меньше 1")
            @Max(value = 10000, message = "Количество страниц должно быть не больше 10000") Integer pageCount,
            @Size(max = 2000, message = "Описание не должно превышать 2000 символов") String description) {}

    public record BookResponse(Long id,
                               String title,
                               String author,
                               Integer publicationYear,
                               List<String> genres,
                               Integer totalCopies,
                               Integer availableCopies,
                               String isbn,
                               String publisher,
                               String language,
                               Integer pageCount,
                               String description,
                               boolean hasFile,
                               boolean hasCover) {}

    public record CatalogMetaResponse(List<String> authors, List<String> genres, List<String> publishers, List<String> languages) {}

    public record RecommendationResponse(BookResponse book, List<String> sourceTags) {}

    public record BookDetailsResponse(BookResponse book, Double averageRating, Long ratingsCount, Integer myRating) {}
}
