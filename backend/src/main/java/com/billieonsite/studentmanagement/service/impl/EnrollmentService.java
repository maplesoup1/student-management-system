package com.billieonsite.studentmanagement.service.impl;

import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.repository.EnrollmentRepository;
import com.billieonsite.studentmanagement.repository.StudentRepository;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.billieonsite.studentmanagement.service.IEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService implements IEnrollmentService {
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassRepository classRepository;
    
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }
    
    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }
    
    public List<Enrollment> getEnrollmentsByStudent(Student student) {
        return enrollmentRepository.findByStudent(student);
    }
    
    public List<Enrollment> getEnrollmentsByClass(Class classEntity) {
        return enrollmentRepository.findByClassEntity(classEntity);
    }
    
    public Enrollment enrollStudent(Long studentId, Long classId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));
        
        if (enrollmentRepository.existsByStudentAndClassEntity(student, classEntity)) {
            throw new RuntimeException("Student is already enrolled in this class");
        }
        
        Enrollment enrollment = new Enrollment(classEntity, student);
        return enrollmentRepository.save(enrollment);
    }
    
    public void unenrollStudent(Long studentId, Long classId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));
        
        Enrollment enrollment = enrollmentRepository.findByStudentAndClassEntity(student, classEntity)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        enrollmentRepository.delete(enrollment);
    }
    
    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
        enrollmentRepository.delete(enrollment);
    }
}