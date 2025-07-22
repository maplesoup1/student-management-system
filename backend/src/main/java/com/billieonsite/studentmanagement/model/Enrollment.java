package com.billieonsite.studentmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "enrollments", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "student_id"}))
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Class course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    public Enrollment() {}

    public Enrollment(Class course, Student student) {
        this.course = course;
        this.student = student;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Class getCourse() {
        return course;
    }

    public void setCourse(Class course) {
        this.course = course;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}