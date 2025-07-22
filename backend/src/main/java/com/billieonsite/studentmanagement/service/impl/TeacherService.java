package com.billieonsite.studentmanagement.service.impl;

import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import com.billieonsite.studentmanagement.service.ITeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherService implements ITeacherService {
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }
    
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }
    
    public List<Teacher> getTeachersBySubject(String subject) {
        return teacherRepository.findBySubject(subject);
    }
    
    public List<Teacher> searchTeachersByName(String name) {
        return teacherRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Teacher createTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }
    
    public Teacher updateTeacher(Long id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
        
        teacher.setName(teacherDetails.getName());
        teacher.setSubject(teacherDetails.getSubject());
        return teacherRepository.save(teacher);
    }
    
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
        teacherRepository.delete(teacher);
    }
}