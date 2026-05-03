package com.example.library.repository;

import com.example.library.model.Event;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByStartDateTimeAsc();

    Optional<Event> findByIdAndCreatedByEmail(Long id, String email);
}
