package com.tvshop.repository;

import com.tvshop.domain.Slide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlideRepository extends JpaRepository<Slide, Long> {
    List<Slide> findAllByOrderByPositionAscIdAsc();
}
