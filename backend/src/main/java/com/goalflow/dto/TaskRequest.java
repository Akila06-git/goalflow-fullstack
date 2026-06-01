package com.goalflow.dto;
public class TaskRequest {
    private String text;
    private Long   goalId;
    public String getText()        { return text; }
    public Long getGoalId()        { return goalId; }
    public void setText(String v)  { this.text = v; }
    public void setGoalId(Long v)  { this.goalId = v; }
}
