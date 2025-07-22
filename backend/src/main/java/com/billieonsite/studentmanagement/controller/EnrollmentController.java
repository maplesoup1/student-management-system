package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.model.Enrollment;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:3000")
public class EnrollmentController {
    
    private List<Enrollment> enrollments = new ArrayList<>();
    private Long nextId = 1L;

    @PostMapping
    public Enrollment createEnrollment(@RequestBody Enrollment enrollment) {
        // Check for duplicate enrollment
        boolean exists = enrollments.stream()
                .anyMatch(e -> e.getClassId().equals(enrollment.getClassId()) && 
                              e.getStudentId().equals(enrollment.getStudentId()));
        
        if (exists) {
            throw new RuntimeException("Student already enrolled in this class");
        }
        
        enrollment.setId(nextId++);
        enrollments.add(enrollment);
        return enrollment;
    }

    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return enrollments;
    }
}