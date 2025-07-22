package com.billieonsite.studentmanagement.service;

import com.billieonsite.studentmanagement.model.Teacher;
import java.util.List;
import java.util.Optional;

public interface ITeacherService {
    List<Teacher> getAllTeachers();
    Optional<Teacher> getTeacherById(Long id);
    List<Teacher> getTeachersBySubject(String subject);
    List<Teacher> searchTeachersByName(String name);
    Teacher createTeacher(Teacher teacher);
    Teacher updateTeacher(Long id, Teacher teacherDetails);
    void deleteTeacher(Long id);
}