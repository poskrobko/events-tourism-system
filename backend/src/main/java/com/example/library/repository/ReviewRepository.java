package com.example.library.repository;

import com.example.library.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);

    java.util.Optional<Review> findFirstByBookIdAndUserIdOrderByCreatedAtDesc(Long bookId, Long userId);

    @Query("""
            select rv from Review rv
            where (:userQuery is null or :userQuery = ''
                   or lower(rv.user.email) like lower(concat('%', :userQuery, '%')))
              and (:bookQuery is null or :bookQuery = ''
                   or lower(rv.book.title) like lower(concat('%', :bookQuery, '%')))
            """)
    Page<Review> searchAdmin(@Param("userQuery") String userQuery,
                             @Param("bookQuery") String bookQuery,
                             Pageable pageable);
}
