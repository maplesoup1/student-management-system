package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.StudentDto;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.repository.StudentRepository;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentDto> studentDtos = students.stream()
            .map(student -> new StudentDto(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getUser() != null ? student.getUser().getId() : null,
                student.getUser() != null ? student.getUser().getUsername() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(studentDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentRepository.findById(id);
        if (student.isPresent()) {
            Student s = student.get();
            StudentDto studentDto = new StudentDto(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getUser() != null ? s.getUser().getId() : null,
                s.getUser() != null ? s.getUser().getUsername() : null
            );
            return ResponseEntity.ok(studentDto);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody StudentDto studentDto) {
        if (studentRepository.existsByEmail(studentDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Student student = new Student(studentDto.getName(), studentDto.getEmail());
        
        if (studentDto.getUserId() != null) {
            Optional<User> user = userRepository.findById(studentDto.getUserId());
            if (user.isPresent()) {
                student.setUser(user.get());
            }
        }

        Student savedStudent = studentRepository.save(student);
        
        StudentDto responseDto = new StudentDto(
            savedStudent.getId(),
            savedStudent.getName(),
            savedStudent.getEmail(),
            savedStudent.getUser() != null ? savedStudent.getUser().getId() : null,
            savedStudent.getUser() != null ? savedStudent.getUser().getUsername() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto studentDto) {
        Optional<Student> studentOptional = studentRepository.findById(id);
        
        if (!studentOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOptional.get();
        
        if (!student.getEmail().equals(studentDto.getEmail()) && 
            studentRepository.existsByEmail(studentDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        student.setName(studentDto.getName());
        student.setEmail(studentDto.getEmail());
        
        if (studentDto.getUserId() != null) {
            Optional<User> user = userRepository.findById(studentDto.getUserId());
            if (user.isPresent()) {
                student.setUser(user.get());
            }
        } else {
            student.setUser(null);
        }

        Student updatedStudent = studentRepository.save(student);
        
        StudentDto responseDto = new StudentDto(
            updatedStudent.getId(),
            updatedStudent.getName(),
            updatedStudent.getEmail(),
            updatedStudent.getUser() != null ? updatedStudent.getUser().getId() : null,
            updatedStudent.getUser() != null ? updatedStudent.getUser().getUsername() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.ok("Student deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}