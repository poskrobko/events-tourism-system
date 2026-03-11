package com.example.library.repository;

import com.example.library.model.Book;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("""
            select b from Book b
            where (:query is null or :query = ''
                    or lower(b.title) like lower(concat('%', :query, '%'))
                    or lower(b.author) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.genresCsv, '')) like lower(concat('%', :query, '%'))
                    or lower(coalesce(b.description, '')) like lower(concat('%', :query, '%')))
              and (:title is null or :title = '' or lower(b.title) like lower(concat('%', :title, '%')))
              and (:author is null or :author = '' or lower(b.author) like lower(concat('%', :author, '%')))
              and (:genre is null or :genre = '' or lower(coalesce(b.genresCsv, '')) like lower(concat('%', :genre, '%')))
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
            @Param("yearFrom") Integer yearFrom,
            @Param("yearTo") Integer yearTo,
            @Param("availability") String availability,
            Pageable pageable
    );

    @Query("select distinct b.author from Book b order by b.author asc")
    List<String> findDistinctAuthors();

    @Query("select distinct b.genresCsv from Book b where b.genresCsv is not null and b.genresCsv <> ''")
    List<String> findDistinctGenresCsv();
}
