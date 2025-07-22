package com.billieonsite.studentmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public class TeacherDto {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    private Long userId;
    private String username;
    
    public TeacherDto() {}
    
    public TeacherDto(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }
    
    public TeacherDto(Long id, String name, String subject) {
        this.id = id;
        this.name = name;
        this.subject = subject;
    }
    
    public TeacherDto(Long id, String name, String subject, Long userId, String username) {
        this.id = id;
        this.name = name;
        this.subject = subject;
        this.userId = userId;
        this.username = username;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
}