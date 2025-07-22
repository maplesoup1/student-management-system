package com.billieonsite.studentmanagement.service.impl;

import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import com.billieonsite.studentmanagement.service.IClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ClassService implements IClassService {
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    public List<Class> getAllClasses() {
        return classRepository.findAll();
    }
    
    public Optional<Class> getClassById(Long id) {
        return classRepository.findById(id);
    }
    
    public List<Class> getClassesByTeacher(Teacher teacher) {
        return classRepository.findByTeacher(teacher);
    }
    
    public List<Class> searchClassesByTitle(String title) {
        return classRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public Class createClass(Class classEntity) {
        if (classEntity.getTeacher() != null && classEntity.getTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(classEntity.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + classEntity.getTeacher().getId()));
            classEntity.setTeacher(teacher);
        }
        return classRepository.save(classEntity);
    }
    
    public Class updateClass(Long id, Class classDetails) {
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));
        
        classEntity.setTitle(classDetails.getTitle());
        classEntity.setSchedule(classDetails.getSchedule());
        
        if (classDetails.getTeacher() != null && classDetails.getTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(classDetails.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + classDetails.getTeacher().getId()));
            classEntity.setTeacher(teacher);
        }
        
        return classRepository.save(classEntity);
    }
    
    public void deleteClass(Long id) {
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));
        classRepository.delete(classEntity);
    }
}