package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(Student student);
    List<Enrollment> findByClassEntity(Class classEntity);
    
    // Deprecated: These methods don't work properly with time slot-based enrollments
    // Use time slot-specific methods instead
    @Deprecated
    Optional<Enrollment> findByStudentAndClassEntity(Student student, Class classEntity);
    @Deprecated  
    boolean existsByStudentAndClassEntity(Student student, Class classEntity);
    
    // Check for specific time slot enrollment
    boolean existsByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
        Student student, Class classEntity, String day, String startTime, String endTime);
    
    // Find specific time slot enrollment
    Optional<Enrollment> findByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
        Student student, Class classEntity, String day, String startTime, String endTime);
    
    // Check for time conflicts (overlapping time slots on the same day) 
    // Excludes exact matches - those are handled by database constraint
    // Using string comparison (works correctly for HH:MM format due to lexicographic ordering)
    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.student = :student AND e.day = :day AND " +
           "((e.startTime < :endTime AND e.endTime > :startTime) " +
           "AND NOT (e.startTime = :startTime AND e.endTime = :endTime))")
    boolean hasTimeConflict(@Param("student") Student student, 
                           @Param("day") String day, 
                           @Param("startTime") String startTime, 
                           @Param("endTime") String endTime);
    
    // Get all enrollments for a student on a specific day
    List<Enrollment> findByStudentAndDay(Student student, String day);
}