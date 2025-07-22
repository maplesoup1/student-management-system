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
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
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
                enrollment.getCourse().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getTeacher() != null ? enrollment.getCourse().getTeacher().getName() : null
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
                e.getCourse().getId(),
                e.getStudent().getName(),
                e.getStudent().getEmail(),
                e.getCourse().getTitle(),
                e.getCourse().getTeacher() != null ? e.getCourse().getTeacher().getName() : null
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
                enrollment.getCourse().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getTeacher() != null ? enrollment.getCourse().getTeacher().getName() : null
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
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(clazz.get());
        List<EnrollmentDto> enrollmentDtos = enrollments.stream()
            .map(enrollment -> new EnrollmentDto(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getCourse().getId(),
                enrollment.getStudent().getName(),
                enrollment.getStudent().getEmail(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getTeacher() != null ? enrollment.getCourse().getTeacher().getName() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(enrollmentDtos);
    }

    @PostMapping
    public ResponseEntity<?> createEnrollment(@Valid @RequestBody EnrollmentDto enrollmentDto) {
        Optional<Student> student = studentRepository.findById(enrollmentDto.getStudentId());
        Optional<Class> clazz = classRepository.findById(enrollmentDto.getClassId());
        
        if (!student.isPresent()) {
            return ResponseEntity.badRequest().body("Student not found");
        }
        
        if (!clazz.isPresent()) {
            return ResponseEntity.badRequest().body("Class not found");
        }
        
        if (enrollmentRepository.existsByStudentAndCourse(student.get(), clazz.get())) {
            return ResponseEntity.badRequest().body("Student already enrolled in this class");
        }

        Enrollment enrollment = new Enrollment(clazz.get(), student.get());
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        EnrollmentDto responseDto = new EnrollmentDto(
            savedEnrollment.getId(),
            savedEnrollment.getStudent().getId(),
            savedEnrollment.getCourse().getId(),
            savedEnrollment.getStudent().getName(),
            savedEnrollment.getStudent().getEmail(),
            savedEnrollment.getCourse().getTitle(),
            savedEnrollment.getCourse().getTeacher() != null ? savedEnrollment.getCourse().getTeacher().getName() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEnrollment(@PathVariable Long id) {
        if (enrollmentRepository.existsById(id)) {
            enrollmentRepository.deleteById(id);
            return ResponseEntity.ok("Enrollment deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/student/{studentId}/class/{classId}")
    public ResponseEntity<String> deleteEnrollmentByStudentAndClass(
            @PathVariable Long studentId, @PathVariable Long classId) {
        
        Optional<Student> student = studentRepository.findById(studentId);
        Optional<Class> clazz = classRepository.findById(classId);
        
        if (!student.isPresent() || !clazz.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentAndCourse(student.get(), clazz.get());
        
        if (enrollment.isPresent()) {
            enrollmentRepository.delete(enrollment.get());
            return ResponseEntity.ok("Enrollment deleted successfully");
        }
        
        return ResponseEntity.notFound().build();
    }
}