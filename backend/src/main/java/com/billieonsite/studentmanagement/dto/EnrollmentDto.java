package com.billieonsite.studentmanagement.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollmentDto {
    private Long id;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    private String studentName;
    private String studentEmail;
    private String classTitle;
    private String teacherName;
    
    // Time slot specific fields
    private String day;
    private String startTime;
    private String endTime;
    private String room;
    
    public EnrollmentDto() {}
    
    public EnrollmentDto(Long studentId, Long classId) {
        this.studentId = studentId;
        this.classId = classId;
    }
    
    public EnrollmentDto(Long studentId, Long classId, String day, String startTime, String endTime, String room) {
        this.studentId = studentId;
        this.classId = classId;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }
    
    public EnrollmentDto(Long id, Long studentId, Long classId, String studentName, 
                        String studentEmail, String classTitle, String teacherName) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.classTitle = classTitle;
        this.teacherName = teacherName;
    }
    
    public EnrollmentDto(Long id, Long studentId, Long classId, String studentName, 
                        String studentEmail, String classTitle, String teacherName,
                        String day, String startTime, String endTime, String room) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.classTitle = classTitle;
        this.teacherName = teacherName;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
    }
    
    public String getStudentName() {
        return studentName;
    }
    
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    
    public String getStudentEmail() {
        return studentEmail;
    }
    
    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }
    
    public String getClassTitle() {
        return classTitle;
    }
    
    public void setClassTitle(String classTitle) {
        this.classTitle = classTitle;
    }
    
    public String getTeacherName() {
        return teacherName;
    }
    
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
    
    public String getDay() {
        return day;
    }
    
    public void setDay(String day) {
        this.day = day;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public String getRoom() {
        return room;
    }
    
    public void setRoom(String room) {
        this.room = room;
    }
}