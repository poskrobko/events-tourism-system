package com.example.library.repository;

import com.example.library.model.EventProgramItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventProgramItemRepository extends JpaRepository<EventProgramItem, Long> {
    List<EventProgramItem> findByEventIdOrderByStartDateTimeAsc(Long eventId);
    Optional<EventProgramItem> findByIdAndEventCreatedByEmail(Long id, String email);
}
