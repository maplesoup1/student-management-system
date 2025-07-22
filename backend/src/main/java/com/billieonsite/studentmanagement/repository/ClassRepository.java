package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    List<Class> findByTeacher(Teacher teacher);
    List<Class> findByTitleContainingIgnoreCase(String title);
}