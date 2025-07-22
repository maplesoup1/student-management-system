package com.billieonsite.studentmanagement.service;

import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import java.util.List;
import java.util.Optional;

public interface IClassService {
    List<Class> getAllClasses();
    Optional<Class> getClassById(Long id);
    List<Class> getClassesByTeacher(Teacher teacher);
    List<Class> searchClassesByTitle(String title);
    Class createClass(Class classEntity);
    Class updateClass(Long id, Class classDetails);
    void deleteClass(Long id);
}