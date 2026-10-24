package com.coworking.repository;

import com.coworking.entity.Desk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeskRepository extends JpaRepository<Desk, Long> {
    List<Desk> findBySpaceId(Long spaceId);
    List<Desk> findBySpaceIdAndActiveTrue(Long spaceId);
}
