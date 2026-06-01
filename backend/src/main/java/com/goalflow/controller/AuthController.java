package com.goalflow.controller;

import com.goalflow.dto.AuthResponse;
import com.goalflow.dto.LoginRequest;
import com.goalflow.dto.RegisterRequest;
import com.goalflow.model.User;
import com.goalflow.security.JwtUtil;
import com.goalflow.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService           userService;
    private final JwtUtil               jwtUtil;

    public AuthController(AuthenticationManager authManager, UserService userService, JwtUtil jwtUtil) {
        this.authManager = authManager; this.userService = userService; this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userService.findByEmail(req.getEmail());
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return ResponseEntity.ok(AuthResponse.builder().token(token).userId(user.getId())
                .name(user.getName()).email(user.getEmail()).avatar(user.getAvatar())
                .level(user.getLevel()).xp(user.getXp()).streak(user.getStreak())
                .joinDate(user.getJoinDate() != null
                        ? user.getJoinDate().getMonth().name().substring(0, 3) + " " + user.getJoinDate().getYear()
                        : "").build());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        User user = userService.register(req);
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return ResponseEntity.ok(AuthResponse.builder().token(token).userId(user.getId())
                .name(user.getName()).email(user.getEmail()).avatar(user.getAvatar())
                .level(1).xp(0).streak(0).joinDate("Now").build());
    }
}
