package com.billieonsite.studentmanagement.security;

import com.billieonsite.studentmanagement.model.Role;

public class UserPrincipal {
    private Long id;
    private String username;
    private Role role;

    public UserPrincipal(Long id, String username, Role role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Role getRole() {
        return role;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}