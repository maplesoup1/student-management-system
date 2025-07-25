package com.billieonsite.studentmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class StudentDto {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    private Long userId;
    private String username;
    
    public StudentDto() {}
    
    public StudentDto(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    public StudentDto(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public StudentDto(Long id, String name, String email, Long userId, String username) {
        this.id = id;
        this.name = name;
        this.email = email;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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