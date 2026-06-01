package com.goalflow.service;

import com.goalflow.dto.RegisterRequest;
import com.goalflow.model.User;
import com.goalflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository  userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        String initials = buildInitials(req.getName());
        User user = User.builder()
                .name(req.getName()).email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .avatar(initials).level(1).xp(0).streak(0).build();
        return userRepo.save(user);
    }

    public User addXp(Long userId, int xpAmount) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setXp(user.getXp() + xpAmount);
        user.setLevel(Math.max(1, (int) Math.floor(user.getXp() / 1000.0) + 1));
        return userRepo.save(user);
    }

    private String buildInitials(String name) {
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) if (!part.isEmpty()) sb.append(part.charAt(0));
        return sb.toString().toUpperCase().substring(0, Math.min(2, sb.length()));
    }
}
