package com.billieonsite.studentmanagement.dto;

import java.time.LocalDateTime;

public class EnrollmentManagementDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long classId;
    private String classTitle;
    private String teacherName;
    private String schedule;
    private LocalDateTime enrollmentDate;
    private String status;
    
    public EnrollmentManagementDto() {}
    
    public EnrollmentManagementDto(Long id, Long studentId, String studentName, String studentEmail,
                                 Long classId, String classTitle, String teacherName, String schedule) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.classId = classId;
        this.classTitle = classTitle;
        this.teacherName = teacherName;
        this.schedule = schedule;
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
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
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
    
    public String getSchedule() {
        return schedule;
    }
    
    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }
    
    public LocalDateTime getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDateTime enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}