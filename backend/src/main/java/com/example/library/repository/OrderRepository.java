package com.example.library.repository;

import com.example.library.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("""
        select distinct o from Order o
        join OrderItem oi on oi.order.id = o.id
        join TicketType tt on tt.id = oi.ticketType.id
        where tt.event.createdBy.email = :managerEmail
        order by o.createdAt desc
    """)
    List<Order> findOrdersByManagerEmail(@Param("managerEmail") String managerEmail);
}
