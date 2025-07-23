package com.billieonsite.studentmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "enrollments", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "student_id", "day", "start_time", "end_time"}))
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Class classEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
    
    // Time slot specific fields
    @Column
    private String day;        // e.g., "monday", "tuesday"
    
    @Column(name = "start_time")
    private String startTime;  // e.g., "09:00"
    
    @Column(name = "end_time")
    private String endTime;    // e.g., "10:30"
    
    @Column
    private String room;       // e.g., "A203"

    public Enrollment() {}

    public Enrollment(Class classEntity, Student student) {
        this.classEntity = classEntity;
        this.student = student;
    }
    
    public Enrollment(Class classEntity, Student student, String day, String startTime, String endTime, String room) {
        this.classEntity = classEntity;
        this.student = student;
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

    public Class getClassEntity() {
        return classEntity;
    }

    public void setClassEntity(Class classEntity) {
        this.classEntity = classEntity;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
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