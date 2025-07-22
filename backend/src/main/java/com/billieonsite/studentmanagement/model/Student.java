package com.billieonsite.studentmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String email;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Student() {}

    public Student(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    public Student(String name, String email, User user) {
        this.name = name;
        this.email = email;
        this.user = user;
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
}