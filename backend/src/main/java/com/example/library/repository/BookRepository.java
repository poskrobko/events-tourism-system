package com.example.library.repository;

import com.example.library.model.Book;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    @Query("""
            select b from Book b
            where (:query is null or :query = ''
                    or lower(b.title) like lower(concat('%', :query, '%'))
                    or lower(b.author) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.genresCsv, '')) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.description, '')) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.publisher, '')) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.language, '')) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.isbn, '')) like lower(concat('%', :query, '%')))
              and (:title is null or :title = '' or lower(b.title) like lower(concat('%', :title, '%')))
              and (:author is null or :author = '' or lower(b.author) like lower(concat('%', :author, '%')))
              and (:genre is null or :genre = '' or lower(coalesce(b.genresCsv, '')) like lower(concat('%', :genre, '%')))
              and (:publisher is null or :publisher = '' or lower(coalesce(b.publisher, '')) like lower(concat('%', :publisher, '%')))
              and (:language is null or :language = '' or lower(coalesce(b.language, '')) like lower(concat('%', :language, '%')))
              and (:isbn is null or :isbn = '' or lower(coalesce(b.isbn, '')) like lower(concat('%', :isbn, '%')))
              and (:yearFrom is null or b.publicationYear >= :yearFrom)
              and (:yearTo is null or b.publicationYear <= :yearTo)
              and (:availability is null
                    or (:availability = 'available' and b.availableCopies > 0)
                    or (:availability = 'unavailable' and b.availableCopies = 0)
                    or :availability = 'all')
            """)
    Page<Book> search(
            @Param("query") String query,
            @Param("title") String title,
            @Param("author") String author,
            @Param("genre") String genre,
            @Param("publisher") String publisher,
            @Param("language") String language,
            @Param("isbn") String isbn,
            @Param("yearFrom") Integer yearFrom,
            @Param("yearTo") Integer yearTo,
            @Param("availability") String availability,
            Pageable pageable
    );

    @Query("select distinct b.author from Book b order by b.author asc")
    List<String> findDistinctAuthors();

    @Query("select distinct b.publisher from Book b where b.publisher is not null and b.publisher <> '' order by b.publisher asc")
    List<String> findDistinctPublishers();

    @Query("select distinct b.language from Book b where b.language is not null and b.language <> '' order by b.language asc")
    List<String> findDistinctLanguages();

    @Query("select distinct b.genresCsv from Book b where b.genresCsv is not null and b.genresCsv <> ''")
    List<String> findDistinctGenresCsv();

    Page<Book> findByGenresCsvContainingIgnoreCaseAndAuthorContainingIgnoreCase(String genresCsv, String author, Pageable pageable);
}

