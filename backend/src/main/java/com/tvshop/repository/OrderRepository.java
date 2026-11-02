package com.tvshop.repository;

import com.tvshop.domain.Order;
import com.tvshop.domain.OrderStatus;
import com.tvshop.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Query("select coalesce(sum(o.total), 0) from Order o where o.status <> :status and o.deleted = false")
    BigDecimal sumRevenueExcluding(@Param("status") OrderStatus status);

    long countByStatusAndDeletedFalse(OrderStatus status);

    long countByDeletedFalse();
}
