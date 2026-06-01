package com.goalflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String avatar;

    @Column(nullable = false)
    private Integer level = 1;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(nullable = false)
    private Integer streak = 0;

    @Column(name = "join_date")
    private LocalDateTime joinDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Goal> goals;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> tasks;

    @PrePersist
    void prePersist() {
        if (this.joinDate == null) this.joinDate = LocalDateTime.now();
        if (this.level == null)    this.level    = 1;
        if (this.xp == null)       this.xp       = 0;
        if (this.streak == null)   this.streak   = 0;
    }

    public User() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User u = new User();
        public Builder name(String v)     { u.name = v; return this; }
        public Builder email(String v)    { u.email = v; return this; }
        public Builder password(String v) { u.password = v; return this; }
        public Builder avatar(String v)   { u.avatar = v; return this; }
        public Builder level(Integer v)   { u.level = v; return this; }
        public Builder xp(Integer v)      { u.xp = v; return this; }
        public Builder streak(Integer v)  { u.streak = v; return this; }
        public User build()               { return u; }
    }

    public Long getId()           { return id; }
    public String getName()       { return name; }
    public String getEmail()      { return email; }
    public String getPassword()   { return password; }
    public String getAvatar()     { return avatar; }
    public Integer getLevel()     { return level; }
    public Integer getXp()        { return xp; }
    public Integer getStreak()    { return streak; }
    public LocalDateTime getJoinDate() { return joinDate; }

    public void setId(Long id)           { this.id = id; }
    public void setName(String name)     { this.name = name; }
    public void setEmail(String email)   { this.email = email; }
    public void setPassword(String p)    { this.password = p; }
    public void setAvatar(String a)      { this.avatar = a; }
    public void setLevel(Integer l)      { this.level = l; }
    public void setXp(Integer xp)        { this.xp = xp; }
    public void setStreak(Integer s)     { this.streak = s; }
    public void setJoinDate(LocalDateTime d) { this.joinDate = d; }
}
