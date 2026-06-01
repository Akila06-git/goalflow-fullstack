package com.goalflow.dto;
public class AuthResponse {
    private String token;
    private Long   userId;
    private String name;
    private String email;
    private String avatar;
    private Integer level;
    private Integer xp;
    private Integer streak;
    private String  joinDate;

    public AuthResponse() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final AuthResponse r = new AuthResponse();
        public Builder token(String v)    { r.token = v; return this; }
        public Builder userId(Long v)     { r.userId = v; return this; }
        public Builder name(String v)     { r.name = v; return this; }
        public Builder email(String v)    { r.email = v; return this; }
        public Builder avatar(String v)   { r.avatar = v; return this; }
        public Builder level(Integer v)   { r.level = v; return this; }
        public Builder xp(Integer v)      { r.xp = v; return this; }
        public Builder streak(Integer v)  { r.streak = v; return this; }
        public Builder joinDate(String v) { r.joinDate = v; return this; }
        public AuthResponse build()       { return r; }
    }

    public String getToken()    { return token; }
    public Long getUserId()     { return userId; }
    public String getName()     { return name; }
    public String getEmail()    { return email; }
    public String getAvatar()   { return avatar; }
    public Integer getLevel()   { return level; }
    public Integer getXp()      { return xp; }
    public Integer getStreak()  { return streak; }
    public String getJoinDate() { return joinDate; }
}
