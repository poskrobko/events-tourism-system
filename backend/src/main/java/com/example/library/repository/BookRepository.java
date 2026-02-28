package com.example.library.repository;

import com.example.library.model.Book;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookRepository extends JpaRepository<Book, Long> {
    Page<Book> findByGenresCsvContainingIgnoreCaseAndAuthorContainingIgnoreCase(String genre, String author, Pageable pageable);

    @Query("select distinct b.author from Book b order by b.author asc")
    List<String> findDistinctAuthors();

    @Query("select distinct b.genresCsv from Book b where b.genresCsv is not null and b.genresCsv <> ''")
    List<String> findDistinctGenresCsv();
}
