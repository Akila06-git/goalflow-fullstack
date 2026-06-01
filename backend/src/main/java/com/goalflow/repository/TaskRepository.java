package com.goalflow.repository;

import com.goalflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndTaskDate(Long userId, LocalDate date);
    List<Task> findByGoalId(Long goalId);
    long countByUserIdAndDoneTrue(Long userId);
    long countByUserIdAndTaskDate(Long userId, LocalDate date);
}
