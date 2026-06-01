package com.goalflow.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String category;
    private String icon;

    @Column(nullable = false)
    private Integer progress = 0;

    private LocalDate deadline;

    @Column(nullable = false)
    private Integer xp = 100;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> tasks;

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.progress == null)  this.progress  = 0;
        if (this.xp == null)        this.xp        = 100;
    }

    public Goal() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Goal g = new Goal();
        public Builder user(User v)        { g.user = v; return this; }
        public Builder title(String v)     { g.title = v; return this; }
        public Builder category(String v)  { g.category = v; return this; }
        public Builder icon(String v)      { g.icon = v; return this; }
        public Builder progress(Integer v) { g.progress = v; return this; }
        public Builder deadline(LocalDate v) { g.deadline = v; return this; }
        public Builder xp(Integer v)       { g.xp = v; return this; }
        public Goal build()                { return g; }
    }

    public Long getId()              { return id; }
    public User getUser()            { return user; }
    public String getTitle()         { return title; }
    public String getCategory()      { return category; }
    public String getIcon()          { return icon; }
    public Integer getProgress()     { return progress; }
    public LocalDate getDeadline()   { return deadline; }
    public Integer getXp()           { return xp; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id)             { this.id = id; }
    public void setUser(User user)         { this.user = user; }
    public void setTitle(String title)     { this.title = title; }
    public void setCategory(String c)      { this.category = c; }
    public void setIcon(String icon)       { this.icon = icon; }
    public void setProgress(Integer p)     { this.progress = p; }
    public void setDeadline(LocalDate d)   { this.deadline = d; }
    public void setXp(Integer xp)          { this.xp = xp; }
    public void setCreatedAt(LocalDateTime d) { this.createdAt = d; }
}
