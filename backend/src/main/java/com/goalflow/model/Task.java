package com.goalflow.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private Boolean done = false;

    @Column(name = "task_date")
    private LocalDate taskDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.taskDate  == null) this.taskDate  = LocalDate.now();
        if (this.done      == null) this.done      = false;
    }

    public Task() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Task t = new Task();
        public Builder user(User v)       { t.user = v; return this; }
        public Builder goal(Goal v)       { t.goal = v; return this; }
        public Builder text(String v)     { t.text = v; return this; }
        public Builder done(Boolean v)    { t.done = v; return this; }
        public Builder taskDate(LocalDate v) { t.taskDate = v; return this; }
        public Task build()               { return t; }
    }

    public Long getId()             { return id; }
    public User getUser()           { return user; }
    public Goal getGoal()           { return goal; }
    public String getText()         { return text; }
    public Boolean getDone()        { return done; }
    public LocalDate getTaskDate()  { return taskDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id)          { this.id = id; }
    public void setUser(User user)      { this.user = user; }
    public void setGoal(Goal goal)      { this.goal = goal; }
    public void setText(String text)    { this.text = text; }
    public void setDone(Boolean done)   { this.done = done; }
    public void setTaskDate(LocalDate d){ this.taskDate = d; }
    public void setCreatedAt(LocalDateTime d) { this.createdAt = d; }
}
