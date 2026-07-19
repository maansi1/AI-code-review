package com.aicodereview.repository;

import com.aicodereview.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.project.user.id = :userId ORDER BY r.createdAt DESC")
    List<Review> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Review r WHERE r.project.user.id = :userId " +
           "AND (:query IS NULL OR LOWER(r.project.projectName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<Review> searchByUserId(@Param("userId") Long userId, @Param("query") String query);
}
