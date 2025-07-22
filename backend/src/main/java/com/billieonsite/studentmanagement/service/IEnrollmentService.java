package com.billieonsite.studentmanagement.service;

import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import java.util.List;
import java.util.Optional;

public interface IEnrollmentService {
    List<Enrollment> getAllEnrollments();
    Optional<Enrollment> getEnrollmentById(Long id);
    List<Enrollment> getEnrollmentsByStudent(Student student);
    List<Enrollment> getEnrollmentsByClass(Class classEntity);
    Enrollment enrollStudent(Long studentId, Long classId);
    void unenrollStudent(Long studentId, Long classId);
    void deleteEnrollment(Long id);
}