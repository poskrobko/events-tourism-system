package com.example.library.repository;

import com.example.library.model.Event;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    @EntityGraph(attributePaths = "createdBy")
    List<Event> findAllByOrderByStartDateTimeAsc(Pageable pageable);

    @EntityGraph(attributePaths = "createdBy")
    Optional<Event> findById(Long id);

    @EntityGraph(attributePaths = "createdBy")
    Optional<Event> findByIdAndCreatedByEmail(Long id, String email);

    @EntityGraph(attributePaths = "createdBy")
    List<Event> findByCreatedByEmailOrderByStartDateTimeAsc(String email);
}
