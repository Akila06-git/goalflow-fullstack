package com.goalflow.dto;
import java.time.LocalDate;
public class GoalRequest {
    private String    title;
    private String    category;
    private String    icon;
    private LocalDate deadline;
    public String getTitle()      { return title; }
    public String getCategory()   { return category; }
    public String getIcon()       { return icon; }
    public LocalDate getDeadline(){ return deadline; }
    public void setTitle(String v)      { this.title = v; }
    public void setCategory(String v)   { this.category = v; }
    public void setIcon(String v)       { this.icon = v; }
    public void setDeadline(LocalDate v){ this.deadline = v; }
}
