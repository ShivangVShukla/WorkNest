package com.coworking.repository;

import com.coworking.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUserId(Long userId);
    Optional<Member> findByUserEmail(String email);
}
