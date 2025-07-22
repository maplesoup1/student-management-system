package com.billieonsite.studentmanagement.dto;

public class ClassSummaryDto {
    private Long id;
    private String title;
    private String schedule;
    private int enrolledStudents;
    private String teacherName;
    
    public ClassSummaryDto() {}
    
    public ClassSummaryDto(Long id, String title, String schedule, int enrolledStudents) {
        this.id = id;
        this.title = title;
        this.schedule = schedule;
        this.enrolledStudents = enrolledStudents;
    }
    
    public ClassSummaryDto(Long id, String title, String schedule, int enrolledStudents, String teacherName) {
        this.id = id;
        this.title = title;
        this.schedule = schedule;
        this.enrolledStudents = enrolledStudents;
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
    
    public String getSchedule() {
        return schedule;
    }
    
    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }
    
    public int getEnrolledStudents() {
        return enrolledStudents;
    }
    
    public void setEnrolledStudents(int enrolledStudents) {
        this.enrolledStudents = enrolledStudents;
    }
    
    public String getTeacherName() {
        return teacherName;
    }
    
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
}