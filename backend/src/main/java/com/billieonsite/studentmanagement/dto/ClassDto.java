package com.billieonsite.studentmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ClassDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @JsonProperty("schedule")
    private Object schedule;
    
    private String subject;
    
    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    
    private String teacherName;
    
    public ClassDto() {}
    
    public ClassDto(String title, Object schedule, Long teacherId) {
        this.title = title;
        this.schedule = schedule;
        this.teacherId = teacherId;
    }
    
    public ClassDto(Long id, String title, Object schedule, Long teacherId, String teacherName) {
        this.id = id;
        this.title = title;
        this.schedule = schedule;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
    }
    
    public ClassDto(Long id, String title, Object schedule, String subject, Long teacherId, String teacherName) {
        this.id = id;
        this.title = title;
        this.schedule = schedule;
        this.subject = subject;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public Object getSchedule() {
        return schedule;
    }
    
    public void setSchedule(Object schedule) {
        this.schedule = schedule;
    }
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }
    
    public String getTeacherName() {
        return teacherName;
    }
    
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
}