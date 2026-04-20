package com.example.library.repository;

import com.example.library.model.TicketType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    List<TicketType> findByEventIdOrderByPriceAsc(Long eventId);

    @Query("select min(tt.price) from TicketType tt where tt.event.id = :eventId")
    Optional<BigDecimal> findMinPriceByEventId(Long eventId);
}
