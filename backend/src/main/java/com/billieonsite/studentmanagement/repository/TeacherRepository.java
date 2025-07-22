package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findBySubject(String subject);
    List<Teacher> findByNameContainingIgnoreCase(String name);
}