package com.goalflow.dto;
import java.time.LocalDate;
public class GoalResponse {
    private Long      id;
    private Long      userId;
    private String    title;
    private String    category;
    private String    icon;
    private Integer   progress;
    private LocalDate deadline;
    private Integer   xp;
    private String    createdAt;

    public GoalResponse() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final GoalResponse r = new GoalResponse();
        public Builder id(Long v)           { r.id = v; return this; }
        public Builder userId(Long v)       { r.userId = v; return this; }
        public Builder title(String v)      { r.title = v; return this; }
        public Builder category(String v)   { r.category = v; return this; }
        public Builder icon(String v)       { r.icon = v; return this; }
        public Builder progress(Integer v)  { r.progress = v; return this; }
        public Builder deadline(LocalDate v){ r.deadline = v; return this; }
        public Builder xp(Integer v)        { r.xp = v; return this; }
        public Builder createdAt(String v)  { r.createdAt = v; return this; }
        public GoalResponse build()         { return r; }
    }

    public Long getId()           { return id; }
    public Long getUserId()       { return userId; }
    public String getTitle()      { return title; }
    public String getCategory()   { return category; }
    public String getIcon()       { return icon; }
    public Integer getProgress()  { return progress; }
    public LocalDate getDeadline(){ return deadline; }
    public Integer getXp()        { return xp; }
    public String getCreatedAt()  { return createdAt; }
}
