package com.example.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BookDtos {
    public record BookRequest(@NotBlank String title,
                              @NotBlank String author,
                              @NotNull Integer publicationYear,
                              List<String> genres,
                              @NotNull Integer copies) {}

    public record BookResponse(Long id, String title, String author, Integer publicationYear,
                               List<String> genres, Integer totalCopies, Integer availableCopies) {}

    public record CatalogMetaResponse(List<String> authors, List<String> genres) {}
}
