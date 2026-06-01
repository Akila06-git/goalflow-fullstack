package com.goalflow.dto;
public class TaskResponse {
    private Long    id;
    private Long    userId;
    private Long    goalId;
    private String  text;
    private Boolean done;
    private String  taskDate;

    public TaskResponse() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final TaskResponse r = new TaskResponse();
        public Builder id(Long v)         { r.id = v; return this; }
        public Builder userId(Long v)     { r.userId = v; return this; }
        public Builder goalId(Long v)     { r.goalId = v; return this; }
        public Builder text(String v)     { r.text = v; return this; }
        public Builder done(Boolean v)    { r.done = v; return this; }
        public Builder taskDate(String v) { r.taskDate = v; return this; }
        public TaskResponse build()       { return r; }
    }

    public Long getId()        { return id; }
    public Long getUserId()    { return userId; }
    public Long getGoalId()    { return goalId; }
    public String getText()    { return text; }
    public Boolean getDone()   { return done; }
    public String getTaskDate(){ return taskDate; }
}
