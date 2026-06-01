package com.goalflow.service;

import com.goalflow.dto.TaskRequest;
import com.goalflow.dto.TaskResponse;
import com.goalflow.model.Goal;
import com.goalflow.model.Task;
import com.goalflow.model.User;
import com.goalflow.repository.GoalRepository;
import com.goalflow.repository.TaskRepository;
import com.goalflow.repository.UserRepository;
import com.goalflow.websocket.RealTimePublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository    taskRepo;
    private final GoalRepository    goalRepo;
    private final UserRepository    userRepo;
    private final RealTimePublisher publisher;
    private final UserService       userService;

    public TaskService(TaskRepository taskRepo, GoalRepository goalRepo, UserRepository userRepo,
                       RealTimePublisher publisher, UserService userService) {
        this.taskRepo = taskRepo; this.goalRepo = goalRepo; this.userRepo = userRepo;
        this.publisher = publisher; this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(Long userId) {
        return taskRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTodayTasks(Long userId) {
        return taskRepo.findByUserIdAndTaskDate(userId, LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskResponse createTask(Long userId, TaskRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Goal goal = req.getGoalId() != null ? goalRepo.findById(req.getGoalId()).orElse(null) : null;
        Task task = Task.builder().user(user).goal(goal).text(req.getText())
                .done(false).taskDate(LocalDate.now()).build();
        task = taskRepo.save(task);
        TaskResponse response = toResponse(task);
        publisher.publishTaskEvent(userId, "TASK_ADDED", response);
        return response;
    }

    public TaskResponse toggleTask(Long taskId, Long userId) {
        Task task = taskRepo.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        if (!task.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        task.setDone(!task.getDone());
        task = taskRepo.save(task);
        if (task.getDone()) {
            userService.addXp(userId, 10);
            publisher.publishActivity(task.getUser().getName() + " completed: " + task.getText(), userId);
        }
        TaskResponse response = toResponse(task);
        publisher.publishTaskEvent(userId, "TASK_UPDATED", response);
        return response;
    }

    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepo.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        if (!task.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        taskRepo.delete(task);
        publisher.publishTaskEvent(userId, "TASK_DELETED", java.util.Map.of("taskId", taskId));
    }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder().id(t.getId()).userId(t.getUser().getId())
                .goalId(t.getGoal() != null ? t.getGoal().getId() : null)
                .text(t.getText()).done(t.getDone())
                .taskDate(t.getTaskDate() != null ? t.getTaskDate().toString() : null).build();
    }
}
