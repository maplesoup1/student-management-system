package com.billieonsite.studentmanagement.dto;

import java.util.List;

public class TeacherDashboardDto {
    private Long teacherId;
    private String teacherName;
    private String subject;
    private List<ClassSummaryDto> classes;
    private int totalStudents;
    private int totalClasses;
    
    public TeacherDashboardDto() {}
    
    public TeacherDashboardDto(Long teacherId, String teacherName, String subject) {
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.subject = subject;
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
    
    public List<ClassSummaryDto> getClasses() {
        return classes;
    }
    
    public void setClasses(List<ClassSummaryDto> classes) {
        this.classes = classes;
    }
    
    public int getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public int getTotalClasses() {
        return totalClasses;
    }
    
    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }
}