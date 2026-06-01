package com.goalflow.dto;
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    public String getName()     { return name; }
    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public void setName(String n)     { this.name = n; }
    public void setEmail(String e)    { this.email = e; }
    public void setPassword(String p) { this.password = p; }
}
