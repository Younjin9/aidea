package com.aidea.backend.domain.user.repository;

import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
  void deleteAllByUser(User user);

  List<UserInterest> findAllByUser(User user);

  @Modifying(clearAutomatically = true)
  @Query("delete from UserInterest ui where ui.user.userId = :userId")
  void deleteByUser_UserId(Long userId);
}
