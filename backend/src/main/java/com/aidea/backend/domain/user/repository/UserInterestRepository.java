package com.aidea.backend.domain.user.repository;

import com.aidea.backend.domain.user.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aidea.backend.domain.user.entity.User;

import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
  void deleteAllByUser(User user);

  List<UserInterest> findAllByUser(User user);

  void deleteByUser_UserId(Long userId);
}
