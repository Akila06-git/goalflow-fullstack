package com.goalflow.controller;

import com.goalflow.dto.TaskRequest;
import com.goalflow.dto.TaskResponse;
import com.goalflow.security.JwtUtil;
import com.goalflow.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final JwtUtil     jwtUtil;

    public TaskController(TaskService taskService, JwtUtil jwtUtil) {
        this.taskService = taskService; this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(taskService.getTasks(jwtUtil.extractUserId(bearer.replace("Bearer ", ""))));
    }

    @GetMapping("/today")
    public ResponseEntity<List<TaskResponse>> getTodayTasks(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(taskService.getTodayTasks(jwtUtil.extractUserId(bearer.replace("Bearer ", ""))));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestHeader("Authorization") String bearer,
            @RequestBody TaskRequest req) {
        return ResponseEntity.ok(taskService.createTask(jwtUtil.extractUserId(bearer.replace("Bearer ", "")), req));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggleTask(@RequestHeader("Authorization") String bearer,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleTask(id, jwtUtil.extractUserId(bearer.replace("Bearer ", ""))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTask(@RequestHeader("Authorization") String bearer,
            @PathVariable Long id) {
        taskService.deleteTask(id, jwtUtil.extractUserId(bearer.replace("Bearer ", "")));
        return ResponseEntity.ok(Map.of("success", true));
    }
}
