package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.EnrollmentDto;
import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.repository.EnrollmentRepository;
import com.billieonsite.studentmanagement.repository.StudentRepository;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public ResponseEntity<List<EnrollmentDto>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<EnrollmentDto> enrollmentDtos = enrollments.stream()
            .map(enrollment -> new EnrollmentDto(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getClassEntity().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getClassEntity().getTitle(),
                enrollment.getClassEntity().getTeacher() != null ? enrollment.getClassEntity().getTeacher().getName() : null,
                enrollment.getDay(),
                enrollment.getStartTime(),
                enrollment.getEndTime(),
                enrollment.getRoom()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(enrollmentDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentDto> getEnrollmentById(@PathVariable Long id) {
        Optional<Enrollment> enrollment = enrollmentRepository.findById(id);
        if (enrollment.isPresent()) {
            Enrollment e = enrollment.get();
            EnrollmentDto enrollmentDto = new EnrollmentDto(
                e.getId(),
                e.getStudent().getId(),
                e.getClassEntity().getId(),
                e.getStudent().getName(),
                e.getStudent().getEmail(),
                e.getClassEntity().getTitle(),
                e.getClassEntity().getTeacher() != null ? e.getClassEntity().getTeacher().getName() : null,
                e.getDay(),
                e.getStartTime(),
                e.getEndTime(),
                e.getRoom()
            );
            return ResponseEntity.ok(enrollmentDto);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        Optional<Student> student = studentRepository.findById(studentId);
        if (!student.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student.get());
        List<EnrollmentDto> enrollmentDtos = enrollments.stream()
            .map(enrollment -> new EnrollmentDto(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getClassEntity().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getClassEntity().getTitle(),
                enrollment.getClassEntity().getTeacher() != null ? enrollment.getClassEntity().getTeacher().getName() : null,
                enrollment.getDay(),
                enrollment.getStartTime(),
                enrollment.getEndTime(),
                enrollment.getRoom()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(enrollmentDtos);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByClass(@PathVariable Long classId) {
        Optional<Class> clazz = classRepository.findById(classId);
        if (!clazz.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Enrollment> enrollments = enrollmentRepository.findByClassEntity(clazz.get());
        List<EnrollmentDto> enrollmentDtos = enrollments.stream()
            .map(enrollment -> new EnrollmentDto(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getClassEntity().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getClassEntity().getTitle(),
                enrollment.getClassEntity().getTeacher() != null ? enrollment.getClassEntity().getTeacher().getName() : null,
                enrollment.getDay(),
                enrollment.getStartTime(),
                enrollment.getEndTime(),
                enrollment.getRoom()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(enrollmentDtos);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createEnrollment(@Valid @RequestBody EnrollmentDto enrollmentDto) {
        // Basic entity validation
        Optional<Student> student = studentRepository.findById(enrollmentDto.getStudentId());
        Optional<Class> clazz = classRepository.findById(enrollmentDto.getClassId());
        
        if (!student.isPresent()) {
            return ResponseEntity.badRequest().body("Student not found with ID: " + enrollmentDto.getStudentId());
        }
        
        if (!clazz.isPresent()) {
            return ResponseEntity.badRequest().body("Class not found with ID: " + enrollmentDto.getClassId());
        }
        
        // Check for time conflicts (overlapping time slots on the same day)
        // This is the only check we need - database constraint will handle exact duplicates
        if (enrollmentRepository.hasTimeConflict(student.get(), enrollmentDto.getDay(), 
                enrollmentDto.getStartTime(), enrollmentDto.getEndTime())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Schedule conflict: Student has an overlapping time slot on " + enrollmentDto.getDay());
        }
        
        try {
            // Create and save enrollment - database constraint will prevent exact duplicates
            Enrollment enrollment = new Enrollment(clazz.get(), student.get(), 
                enrollmentDto.getDay(), enrollmentDto.getStartTime(), 
                enrollmentDto.getEndTime(), enrollmentDto.getRoom());
            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
            
            EnrollmentDto responseDto = new EnrollmentDto(
                savedEnrollment.getId(),
                savedEnrollment.getStudent().getId(),
                savedEnrollment.getClassEntity().getId(),
                savedEnrollment.getStudent().getName(),
                savedEnrollment.getStudent().getEmail(),
                savedEnrollment.getClassEntity().getTitle(),
                savedEnrollment.getClassEntity().getTeacher() != null ? savedEnrollment.getClassEntity().getTeacher().getName() : null,
                savedEnrollment.getDay(),
                savedEnrollment.getStartTime(),
                savedEnrollment.getEndTime(),
                savedEnrollment.getRoom()
            );
            
            return ResponseEntity.ok(responseDto);
            
        } catch (Exception e) {
            // Handle database constraint violations (like duplicate enrollments)
            if (e.getMessage().contains("unique constraint") || e.getMessage().contains("duplicate key")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student already enrolled in this exact time slot");
            }
            throw e; // Re-throw other exceptions
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEnrollment(@PathVariable Long id) {
        if (enrollmentRepository.existsById(id)) {
            enrollmentRepository.deleteById(id);
            return ResponseEntity.ok("Enrollment deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // Removed outdated deletion endpoint that doesn't work with time slot-based enrollments
    // Use DELETE /{id} instead to delete specific enrollment records
}