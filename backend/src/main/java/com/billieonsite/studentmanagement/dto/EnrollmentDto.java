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
    
    public EnrollmentDto() {}
    
    public EnrollmentDto(Long studentId, Long classId) {
        this.studentId = studentId;
        this.classId = classId;
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
}