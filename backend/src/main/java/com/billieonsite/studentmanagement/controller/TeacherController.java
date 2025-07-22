package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.model.Class;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    
    private List<Teacher> teachers = new ArrayList<>();
    private List<Class> classes = new ArrayList<>(); // Temporary - should be injected
    private Long nextId = 1L;

    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        teacher.setId(nextId++);
        teachers.add(teacher);
        return teacher;
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teachers;
    }

    @GetMapping("/{id}/classes")
    public List<Class> getTeacherClasses(@PathVariable Long id) {
        return classes.stream()
                .filter(c -> c.getTeacherId().equals(id))
                .collect(Collectors.toList());
    }
}