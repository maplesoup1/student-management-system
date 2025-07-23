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
                e.getClassEntity().getTeacher() != null ? e.getClassEntity().getTeacher().getName() : null
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
    public ResponseEntity<?> createEnrollment(@Valid @RequestBody EnrollmentDto enrollmentDto) {
        // Debug logging
        System.out.println("Attempting to enroll student ID: " + enrollmentDto.getStudentId() + " in class ID: " + enrollmentDto.getClassId());
        System.out.println("Total students in database: " + studentRepository.count());
        System.out.println("Total classes in database: " + classRepository.count());
        
        Optional<Student> student = studentRepository.findById(enrollmentDto.getStudentId());
        Optional<Class> clazz = classRepository.findById(enrollmentDto.getClassId());
        
        if (!student.isPresent()) {
            System.out.println("Student not found with ID: " + enrollmentDto.getStudentId());
            List<Student> allStudents = studentRepository.findAll();
            System.out.println("Available student IDs: " + allStudents.stream().map(s -> s.getId()).toList());
            return ResponseEntity.badRequest().body("Student not found with ID: " + enrollmentDto.getStudentId());
        }
        
        if (!clazz.isPresent()) {
            return ResponseEntity.badRequest().body("Class not found");
        }
        
        // Check for exact time slot conflict
        if (enrollmentDto.getDay() != null && enrollmentDto.getStartTime() != null && enrollmentDto.getEndTime() != null) {
            // Check if this exact time slot is already enrolled
            if (enrollmentRepository.existsByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
                    student.get(), clazz.get(), enrollmentDto.getDay(), 
                    enrollmentDto.getStartTime(), enrollmentDto.getEndTime())) {
                return ResponseEntity.badRequest().body("Student already enrolled in this time slot");
            }
            
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
        } else {
            // Legacy support: enroll in entire class
            if (enrollmentRepository.existsByStudentAndClassEntity(student.get(), clazz.get())) {
                return ResponseEntity.badRequest().body("Student already enrolled in this class");
            }

            Enrollment enrollment = new Enrollment(clazz.get(), student.get());
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

    @DeleteMapping("/student/{studentId}/class/{classId}")
    public ResponseEntity<String> deleteEnrollmentByStudentAndClass(
            @PathVariable Long studentId, @PathVariable Long classId) {
        
        Optional<Student> student = studentRepository.findById(studentId);
        Optional<Class> clazz = classRepository.findById(classId);
        
        if (!student.isPresent() || !clazz.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentAndClassEntity(student.get(), clazz.get());
        
        if (enrollment.isPresent()) {
            enrollmentRepository.delete(enrollment.get());
            return ResponseEntity.ok("Enrollment deleted successfully");
        }
        
        return ResponseEntity.notFound().build();
    }
}