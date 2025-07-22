package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.ClassDto;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassController {

    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    @GetMapping
    public ResponseEntity<List<ClassDto>> getAllClasses() {
        List<Class> classes = classRepository.findAll();
        List<ClassDto> classDtos = classes.stream()
            .map(clazz -> new ClassDto(
                clazz.getId(),
                clazz.getTitle(),
                clazz.getSchedule(),
                clazz.getTeacher() != null ? clazz.getTeacher().getId() : null,
                clazz.getTeacher() != null ? clazz.getTeacher().getName() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(classDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassDto> getClassById(@PathVariable Long id) {
        Optional<Class> clazz = classRepository.findById(id);
        if (clazz.isPresent()) {
            Class c = clazz.get();
            ClassDto classDto = new ClassDto(
                c.getId(),
                c.getTitle(),
                c.getSchedule(),
                c.getTeacher() != null ? c.getTeacher().getId() : null,
                c.getTeacher() != null ? c.getTeacher().getName() : null
            );
            return ResponseEntity.ok(classDto);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassDto>> getClassesByTeacher(@PathVariable Long teacherId) {
        Optional<Teacher> teacher = teacherRepository.findById(teacherId);
        if (!teacher.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Class> classes = classRepository.findByTeacher(teacher.get());
        List<ClassDto> classDtos = classes.stream()
            .map(clazz -> new ClassDto(
                clazz.getId(),
                clazz.getTitle(),
                clazz.getSchedule(),
                clazz.getTeacher().getId(),
                clazz.getTeacher().getName()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(classDtos);
    }

    @PostMapping
    public ResponseEntity<ClassDto> createClass(@Valid @RequestBody ClassDto classDto) {
        Class clazz = new Class(classDto.getTitle(), classDto.getSchedule(), null);
        
        if (classDto.getTeacherId() != null) {
            Optional<Teacher> teacher = teacherRepository.findById(classDto.getTeacherId());
            if (teacher.isPresent()) {
                clazz.setTeacher(teacher.get());
            }
        }

        Class savedClass = classRepository.save(clazz);
        
        ClassDto responseDto = new ClassDto(
            savedClass.getId(),
            savedClass.getTitle(),
            savedClass.getSchedule(),
            savedClass.getTeacher() != null ? savedClass.getTeacher().getId() : null,
            savedClass.getTeacher() != null ? savedClass.getTeacher().getName() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassDto> updateClass(@PathVariable Long id, @Valid @RequestBody ClassDto classDto) {
        Optional<Class> classOptional = classRepository.findById(id);
        
        if (!classOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Class clazz = classOptional.get();
        clazz.setTitle(classDto.getTitle());
        clazz.setSchedule(classDto.getSchedule());
        
        if (classDto.getTeacherId() != null) {
            Optional<Teacher> teacher = teacherRepository.findById(classDto.getTeacherId());
            if (teacher.isPresent()) {
                clazz.setTeacher(teacher.get());
            }
        } else {
            clazz.setTeacher(null);
        }

        Class updatedClass = classRepository.save(clazz);
        
        ClassDto responseDto = new ClassDto(
            updatedClass.getId(),
            updatedClass.getTitle(),
            updatedClass.getSchedule(),
            updatedClass.getTeacher() != null ? updatedClass.getTeacher().getId() : null,
            updatedClass.getTeacher() != null ? updatedClass.getTeacher().getName() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClass(@PathVariable Long id) {
        if (classRepository.existsById(id)) {
            classRepository.deleteById(id);
            return ResponseEntity.ok("Class deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}