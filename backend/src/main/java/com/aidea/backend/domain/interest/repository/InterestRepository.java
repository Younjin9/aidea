package com.aidea.backend.domain.interest.repository;

import com.aidea.backend.domain.interest.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterestRepository extends JpaRepository<Interest, Long> {
  Optional<Interest> findByInterestName(String interestName);
  java.util.List<Interest> findByCategory(String category);
}
