package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.TeacherDto;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TeacherDto>> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        List<TeacherDto> teacherDtos = teachers.stream()
            .map(teacher -> new TeacherDto(
                teacher.getId(),
                teacher.getName(),
                teacher.getSubject(),
                teacher.getUser() != null ? teacher.getUser().getId() : null,
                teacher.getUser() != null ? teacher.getUser().getUsername() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(teacherDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDto> getTeacherById(@PathVariable Long id) {
        Optional<Teacher> teacher = teacherRepository.findById(id);
        if (teacher.isPresent()) {
            Teacher t = teacher.get();
            TeacherDto teacherDto = new TeacherDto(
                t.getId(),
                t.getName(),
                t.getSubject(),
                t.getUser() != null ? t.getUser().getId() : null,
                t.getUser() != null ? t.getUser().getUsername() : null
            );
            return ResponseEntity.ok(teacherDto);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<TeacherDto>> getTeachersBySubject(@PathVariable String subject) {
        List<Teacher> teachers = teacherRepository.findBySubject(subject);
        List<TeacherDto> teacherDtos = teachers.stream()
            .map(teacher -> new TeacherDto(
                teacher.getId(),
                teacher.getName(),
                teacher.getSubject(),
                teacher.getUser() != null ? teacher.getUser().getId() : null,
                teacher.getUser() != null ? teacher.getUser().getUsername() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(teacherDtos);
    }

    @PostMapping
    public ResponseEntity<TeacherDto> createTeacher(@Valid @RequestBody TeacherDto teacherDto) {
        Teacher teacher = new Teacher(teacherDto.getName(), teacherDto.getSubject());
        
        if (teacherDto.getUserId() != null) {
            Optional<User> user = userRepository.findById(teacherDto.getUserId());
            if (user.isPresent()) {
                teacher.setUser(user.get());
            }
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        
        TeacherDto responseDto = new TeacherDto(
            savedTeacher.getId(),
            savedTeacher.getName(),
            savedTeacher.getSubject(),
            savedTeacher.getUser() != null ? savedTeacher.getUser().getId() : null,
            savedTeacher.getUser() != null ? savedTeacher.getUser().getUsername() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherDto> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherDto teacherDto) {
        Optional<Teacher> teacherOptional = teacherRepository.findById(id);
        
        if (!teacherOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Teacher teacher = teacherOptional.get();
        teacher.setName(teacherDto.getName());
        teacher.setSubject(teacherDto.getSubject());
        
        if (teacherDto.getUserId() != null) {
            Optional<User> user = userRepository.findById(teacherDto.getUserId());
            if (user.isPresent()) {
                teacher.setUser(user.get());
            }
        } else {
            teacher.setUser(null);
        }

        Teacher updatedTeacher = teacherRepository.save(teacher);
        
        TeacherDto responseDto = new TeacherDto(
            updatedTeacher.getId(),
            updatedTeacher.getName(),
            updatedTeacher.getSubject(),
            updatedTeacher.getUser() != null ? updatedTeacher.getUser().getId() : null,
            updatedTeacher.getUser() != null ? updatedTeacher.getUser().getUsername() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTeacher(@PathVariable Long id) {
        if (teacherRepository.existsById(id)) {
            teacherRepository.deleteById(id);
            return ResponseEntity.ok("Teacher deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}