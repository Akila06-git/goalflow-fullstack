package com.goalflow.service;

import com.goalflow.dto.GoalRequest;
import com.goalflow.dto.GoalResponse;
import com.goalflow.model.Goal;
import com.goalflow.model.User;
import com.goalflow.repository.GoalRepository;
import com.goalflow.repository.UserRepository;
import com.goalflow.websocket.RealTimePublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalService {

    private final GoalRepository    goalRepo;
    private final UserRepository    userRepo;
    private final RealTimePublisher publisher;
    private final UserService       userService;

    public GoalService(GoalRepository goalRepo, UserRepository userRepo,
                       RealTimePublisher publisher, UserService userService) {
        this.goalRepo = goalRepo; this.userRepo = userRepo;
        this.publisher = publisher; this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(Long userId) {
        return goalRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GoalResponse createGoal(Long userId, GoalRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Goal goal = Goal.builder().user(user).title(req.getTitle()).category(req.getCategory())
                .icon(req.getIcon() != null ? req.getIcon() : "🎯")
                .deadline(req.getDeadline()).progress(0).xp(100).build();
        goal = goalRepo.save(goal);
        GoalResponse response = toResponse(goal);
        publisher.publishGoalEvent(userId, "GOAL_ADDED", response);
        publisher.publishActivity(user.getName() + " added a new goal: " + req.getTitle(), userId);
        return response;
    }

    public GoalResponse updateGoal(Long goalId, Long userId, GoalRequest req) {
        Goal goal = goalRepo.findById(goalId).orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        if (req.getTitle()    != null) goal.setTitle(req.getTitle());
        if (req.getCategory() != null) goal.setCategory(req.getCategory());
        if (req.getIcon()     != null) goal.setIcon(req.getIcon());
        if (req.getDeadline() != null) goal.setDeadline(req.getDeadline());
        goal = goalRepo.save(goal);
        GoalResponse response = toResponse(goal);
        publisher.publishGoalEvent(userId, "GOAL_UPDATED", response);
        return response;
    }

    public GoalResponse updateProgress(Long goalId, Long userId, int progress) {
        Goal goal = goalRepo.findById(goalId).orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        goal.setProgress(Math.max(0, Math.min(100, progress)));
        goal = goalRepo.save(goal);
        if (goal.getProgress() == 100) {
            userService.addXp(userId, goal.getXp());
            publisher.publishActivity(goal.getUser().getName() + " completed goal: " + goal.getTitle() + "! 🏆", userId);
        }
        GoalResponse response = toResponse(goal);
        publisher.publishGoalEvent(userId, "GOAL_UPDATED", response);
        return response;
    }

    public void deleteGoal(Long goalId, Long userId) {
        Goal goal = goalRepo.findById(goalId).orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        goalRepo.delete(goal);
        publisher.publishGoalEvent(userId, "GOAL_DELETED", java.util.Map.of("goalId", goalId));
    }

    private GoalResponse toResponse(Goal g) {
        return GoalResponse.builder().id(g.getId()).userId(g.getUser().getId())
                .title(g.getTitle()).category(g.getCategory()).icon(g.getIcon())
                .progress(g.getProgress()).deadline(g.getDeadline()).xp(g.getXp())
                .createdAt(g.getCreatedAt() != null ? g.getCreatedAt().toString() : null).build();
    }
}
