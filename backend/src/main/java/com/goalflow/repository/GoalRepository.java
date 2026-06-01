package com.goalflow.repository;

import com.goalflow.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId AND g.category = :category ORDER BY g.createdAt DESC")
    List<Goal> findByUserIdAndCategory(Long userId, String category);
}
