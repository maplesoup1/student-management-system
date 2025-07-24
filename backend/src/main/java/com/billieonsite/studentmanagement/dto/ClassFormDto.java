package com.billieonsite.studentmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ClassFormDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @JsonProperty("schedule")
    private Object schedule; // Can accept JSON object or string
    
    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    
    private Integer maxStudents;
    private String room;
    private String semester;
    
    public ClassFormDto() {}
    
    public ClassFormDto(String title, Object schedule, Long teacherId) {
        this.title = title;
        this.schedule = schedule;
        this.teacherId = teacherId;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public Integer getMaxStudents() {
        return maxStudents;
    }
    
    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }
    
    public String getRoom() {
        return room;
    }
    
    public void setRoom(String room) {
        this.room = room;
    }
    
    public String getSemester() {
        return semester;
    }
    
    public void setSemester(String semester) {
        this.semester = semester;
    }
}