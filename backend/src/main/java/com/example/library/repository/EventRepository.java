package com.example.library.repository;

import com.example.library.model.Event;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("""
        select distinct e from Event e
        left join TicketType tt on tt.event.id = e.id
        where (:dateFrom is null or e.startDateTime >= :dateFrom)
          and (:dateTo is null or e.startDateTime <= :dateTo)
          and (:city is null or lower(e.city) = lower(:city))
          and (:minPrice is null or tt.price >= :minPrice)
          and (:maxPrice is null or tt.price <= :maxPrice)
        order by e.startDateTime asc
    """)
    List<Event> findByFilters(
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
