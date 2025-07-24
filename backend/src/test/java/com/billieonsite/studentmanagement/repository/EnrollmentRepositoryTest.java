package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.model.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class EnrollmentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    private Student testStudent1;
    private Student testStudent2;
    private Class testClass;
    private Teacher testTeacher;
    private Enrollment testEnrollment1;
    private Enrollment testEnrollment2;

    @BeforeEach
    void setUp() {
        // Create test users
        User teacherUser = new User();
        teacherUser.setUsername("teacher1");
        teacherUser.setPassword("password");
        teacherUser.setRole(Role.TEACHER);
        entityManager.persist(teacherUser);

        User studentUser1 = new User();
        studentUser1.setUsername("student1");
        studentUser1.setPassword("password");
        studentUser1.setRole(Role.STUDENT);
        entityManager.persist(studentUser1);

        User studentUser2 = new User();
        studentUser2.setUsername("student2");
        studentUser2.setPassword("password");
        studentUser2.setRole(Role.STUDENT);
        entityManager.persist(studentUser2);

        // Create test teacher
        testTeacher = new Teacher();
        testTeacher.setName("John Smith");
        testTeacher.setSubject("Mathematics");
        testTeacher.setUser(teacherUser);
        entityManager.persist(testTeacher);

        // Create test students
        testStudent1 = new Student();
        testStudent1.setName("Alice Chen");
        testStudent1.setEmail("alice.chen@example.com");
        testStudent1.setUser(studentUser1);
        entityManager.persist(testStudent1);

        testStudent2 = new Student();
        testStudent2.setName("Bob Davis");
        testStudent2.setEmail("bob.davis@example.com");
        testStudent2.setUser(studentUser2);
        entityManager.persist(testStudent2);

        // Create test class with schedule
        testClass = new Class();
        testClass.setTitle("Advanced Mathematics");
        testClass.setTeacher(testTeacher);
        testClass.setSchedule("{}"); // Set an empty JSON string for schedule
        entityManager.persist(testClass);

        // Create test enrollments
        testEnrollment1 = new Enrollment(testClass, testStudent1, "monday", "08:00", "10:00", "A203");
        entityManager.persist(testEnrollment1);

        testEnrollment2 = new Enrollment(testClass, testStudent2, "tuesday", "14:00", "16:00", "B105");
        entityManager.persist(testEnrollment2);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find enrollments by student")
    void findByStudent_Success() {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(testStudent1);

        assertThat(enrollments).hasSize(1);
        assertThat(enrollments.get(0).getStudent()).isEqualTo(testStudent1);
        assertThat(enrollments.get(0).getDay()).isEqualTo("monday");
        assertThat(enrollments.get(0).getStartTime()).isEqualTo("08:00");
        assertThat(enrollments.get(0).getEndTime()).isEqualTo("10:00");
    }

    @Test
    @DisplayName("Should find enrollments by class")
    void findByClassEntity_Success() {
        List<Enrollment> enrollments = enrollmentRepository.findByClassEntity(testClass);

        assertThat(enrollments).hasSize(2);
        assertThat(enrollments).extracting("student").contains(testStudent1, testStudent2);
    }

    @Test
    @DisplayName("Should check if specific time slot enrollment exists")
    void existsByStudentAndClassEntityAndDayAndStartTimeAndEndTime_Success() {
        boolean exists = enrollmentRepository.existsByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
            testStudent1, testClass, "monday", "08:00", "10:00"
        );

        assertThat(exists).isTrue();

        boolean notExists = enrollmentRepository.existsByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
            testStudent1, testClass, "tuesday", "08:00", "10:00"
        );

        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find specific time slot enrollment")
    void findByStudentAndClassEntityAndDayAndStartTimeAndEndTime_Success() {
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
            testStudent1, testClass, "monday", "08:00", "10:00"
        );

        assertThat(enrollment).isPresent();
        assertThat(enrollment.get().getStudent()).isEqualTo(testStudent1);
        assertThat(enrollment.get().getClassEntity()).isEqualTo(testClass);
        assertThat(enrollment.get().getDay()).isEqualTo("monday");

        Optional<Enrollment> notFound = enrollmentRepository.findByStudentAndClassEntityAndDayAndStartTimeAndEndTime(
            testStudent1, testClass, "wednesday", "08:00", "10:00"
        );

        assertThat(notFound).isEmpty();
    }

    @Test
    @DisplayName("Should detect time conflicts - overlapping times")
    void hasTimeConflict_OverlappingTimes() {
        // Test overlapping time slots
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "09:00", "11:00"
        );

        assertThat(hasConflict).isTrue();
    }

    @Test
    @DisplayName("Should detect time conflicts - contained within")
    void hasTimeConflict_ContainedWithin() {
        // Test time slot contained within existing enrollment
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "08:30", "09:30"
        );

        assertThat(hasConflict).isTrue();
    }

    @Test
    @DisplayName("Should detect time conflicts - containing existing")
    void hasTimeConflict_ContainingExisting() {
        // Test time slot that contains existing enrollment
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "07:00", "11:00"
        );

        assertThat(hasConflict).isTrue();
    }

    @Test
    @DisplayName("Should not detect conflict for non-overlapping times")
    void hasTimeConflict_NoOverlap() {
        // Test non-overlapping time slots
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "12:00", "14:00"
        );

        assertThat(hasConflict).isFalse();
    }

    @Test
    @DisplayName("Should not detect conflict for different days")
    void hasTimeConflict_DifferentDay() {
        // Test same time but different day
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "wednesday", "08:00", "10:00"
        );

        assertThat(hasConflict).isFalse();
    }

    @Test
    @DisplayName("Should not detect conflict for different students")
    void hasTimeConflict_DifferentStudent() {
        // Test same time and day but different student
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent2, "monday", "08:00", "10:00"
        );

        assertThat(hasConflict).isFalse();
    }

    @Test
    @DisplayName("Should not detect conflict for exact same time slot (edge case)")
    void hasTimeConflict_ExactMatch() {
        // Test exact same time slot - should not be detected as conflict
        // because exact duplicates are handled by database constraint
        boolean hasConflict = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "08:00", "10:00"
        );

        assertThat(hasConflict).isFalse();
    }

    @Test
    @DisplayName("Should not detect conflict for adjacent time slots")
    void hasTimeConflict_AdjacentTimes() {
        // Test adjacent time slots (no overlap)
        boolean hasConflictBefore = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "06:00", "08:00"
        );
        
        boolean hasConflictAfter = enrollmentRepository.hasTimeConflict(
            testStudent1, "monday", "10:00", "12:00"
        );

        assertThat(hasConflictBefore).isFalse();
        assertThat(hasConflictAfter).isFalse();
    }

    @Test
    @DisplayName("Should find enrollments by student and day")
    void findByStudentAndDay_Success() {
        List<Enrollment> mondayEnrollments = enrollmentRepository.findByStudentAndDay(testStudent1, "monday");
        List<Enrollment> tuesdayEnrollments = enrollmentRepository.findByStudentAndDay(testStudent1, "tuesday");

        assertThat(mondayEnrollments).hasSize(1);
        assertThat(mondayEnrollments.get(0).getDay()).isEqualTo("monday");
        
        assertThat(tuesdayEnrollments).isEmpty();
    }

    @Test
    @DisplayName("Should handle time comparison edge cases")
    void hasTimeConflict_TimeComparisonEdgeCases() {
        // Create enrollment with specific time slot
        Enrollment edgeEnrollment = new Enrollment(testClass, testStudent2, "friday", "10:00", "12:00", "C301");
        entityManager.persist(edgeEnrollment);
        entityManager.flush();

        // Test various edge cases for time comparison
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "friday", "09:30", "10:30")).isTrue(); // starts before, ends during
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "friday", "11:30", "13:30")).isTrue(); // starts during, ends after
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "friday", "09:00", "10:00")).isFalse(); // ends exactly when existing starts
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "friday", "12:00", "14:00")).isFalse(); // starts exactly when existing ends
    }

    @Test
    @DisplayName("Should handle complex time slot scenarios")
    void hasTimeConflict_ComplexScenarios() {
        // Add multiple enrollments for the same student on the same day
        Enrollment morning = new Enrollment(testClass, testStudent2, "wednesday", "08:00", "10:00", "A101");
        Enrollment afternoon = new Enrollment(testClass, testStudent2, "wednesday", "14:00", "16:00", "B202");
        entityManager.persist(morning);
        entityManager.persist(afternoon);
        entityManager.flush();

        // Test time slot between existing enrollments - should not conflict
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "wednesday", "10:30", "13:30")).isFalse();
        
        // Test time slot overlapping with first enrollment
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "wednesday", "09:00", "11:00")).isTrue();
        
        // Test time slot overlapping with second enrollment
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "wednesday", "13:00", "15:00")).isTrue();
        
        // Test time slot spanning both enrollments
        assertThat(enrollmentRepository.hasTimeConflict(testStudent2, "wednesday", "07:00", "17:00")).isTrue();
    }
}