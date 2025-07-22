package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(Student student);
    List<Enrollment> findByCourse(Class course);
    Optional<Enrollment> findByStudentAndCourse(Student student, Class course);
    boolean existsByStudentAndCourse(Student student, Class course);
}