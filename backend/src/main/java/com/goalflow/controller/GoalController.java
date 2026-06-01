package com.goalflow.controller;

import com.goalflow.dto.GoalRequest;
import com.goalflow.dto.GoalResponse;
import com.goalflow.dto.UpdateProgressRequest;
import com.goalflow.security.JwtUtil;
import com.goalflow.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;
    private final JwtUtil     jwtUtil;

    public GoalController(GoalService goalService, JwtUtil jwtUtil) {
        this.goalService = goalService; this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(goalService.getGoals(jwtUtil.extractUserId(bearer.replace("Bearer ", ""))));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@RequestHeader("Authorization") String bearer,
            @RequestBody GoalRequest req) {
        return ResponseEntity.ok(goalService.createGoal(jwtUtil.extractUserId(bearer.replace("Bearer ", "")), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(@RequestHeader("Authorization") String bearer,
            @PathVariable Long id, @RequestBody GoalRequest req) {
        return ResponseEntity.ok(goalService.updateGoal(id, jwtUtil.extractUserId(bearer.replace("Bearer ", "")), req));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<GoalResponse> updateProgress(@RequestHeader("Authorization") String bearer,
            @PathVariable Long id, @RequestBody UpdateProgressRequest req) {
        return ResponseEntity.ok(goalService.updateProgress(id, jwtUtil.extractUserId(bearer.replace("Bearer ", "")), req.getProgress()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteGoal(@RequestHeader("Authorization") String bearer,
            @PathVariable Long id) {
        goalService.deleteGoal(id, jwtUtil.extractUserId(bearer.replace("Bearer ", "")));
        return ResponseEntity.ok(Map.of("success", true));
    }
}
