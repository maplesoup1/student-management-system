package com.billieonsite.studentmanagement.dto;

import com.billieonsite.studentmanagement.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserDto {
    private Long id;
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    public UserDto() {}
    
    public UserDto(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
    
    public UserDto(Long id, String username, Role role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
}