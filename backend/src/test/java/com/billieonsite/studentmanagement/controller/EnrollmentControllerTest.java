package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.EnrollmentDto;
import com.billieonsite.studentmanagement.model.Enrollment;
import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.EnrollmentRepository;
import com.billieonsite.studentmanagement.repository.StudentRepository;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(EnrollmentController.class)
@WithMockUser
class EnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private StudentRepository studentRepository;

    @MockBean
    private ClassRepository classRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Student testStudent;
    private Class testClass;
    private Teacher testTeacher;
    private Enrollment testEnrollment;
    private EnrollmentDto testEnrollmentDto;

    @BeforeEach
    void setUp() {
        // Create test teacher
        testTeacher = new Teacher();
        testTeacher.setId(1L);
        testTeacher.setName("John Smith");
        testTeacher.setSubject("Mathematics");

        // Create test student
        testStudent = new Student();
        testStudent.setId(1L);
        testStudent.setName("Alice Chen");
        testStudent.setEmail("alice.chen@example.com");

        // Create test class
        testClass = new Class();
        testClass.setId(1L);
        testClass.setTitle("Advanced Mathematics");
        testClass.setTeacher(testTeacher);

        // Create test enrollment
        testEnrollment = new Enrollment(testClass, testStudent, "monday", "08:00", "10:00", "A203");
        testEnrollment.setId(1L);

        // Create test enrollment DTO
        testEnrollmentDto = new EnrollmentDto(
            1L, 1L, 1L, "Alice Chen", "alice.chen@example.com",
            "Advanced Mathematics", "John Smith", "monday", "08:00", "10:00", "A203"
        );
    }

    @Test
    @DisplayName("Should get all enrollments successfully")
    void getAllEnrollments_Success() throws Exception {
        List<Enrollment> enrollments = Arrays.asList(testEnrollment);
        when(enrollmentRepository.findAll()).thenReturn(enrollments);

        mockMvc.perform(get("/api/enrollments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].studentName").value("Alice Chen"))
                .andExpect(jsonPath("$[0].classTitle").value("Advanced Mathematics"))
                .andExpect(jsonPath("$[0].day").value("monday"))
                .andExpect(jsonPath("$[0].startTime").value("08:00"))
                .andExpect(jsonPath("$[0].endTime").value("10:00"))
                .andExpect(jsonPath("$[0].room").value("A203"));

        verify(enrollmentRepository).findAll();
    }

    @Test
    @DisplayName("Should get enrollment by ID successfully")
    void getEnrollmentById_Success() throws Exception {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));

        mockMvc.perform(get("/api/enrollments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.studentName").value("Alice Chen"))
                .andExpect(jsonPath("$.classTitle").value("Advanced Mathematics"));

        verify(enrollmentRepository).findById(1L);
    }

    @Test
    @DisplayName("Should return 404 when enrollment not found")
    void getEnrollmentById_NotFound() throws Exception {
        when(enrollmentRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/enrollments/999"))
                .andExpect(status().isNotFound());

        verify(enrollmentRepository).findById(999L);
    }

    @Test
    @DisplayName("Should get enrollments by student successfully")
    void getEnrollmentsByStudent_Success() throws Exception {
        List<Enrollment> enrollments = Arrays.asList(testEnrollment);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(enrollmentRepository.findByStudent(testStudent)).thenReturn(enrollments);

        mockMvc.perform(get("/api/enrollments/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].studentName").value("Alice Chen"));

        verify(studentRepository).findById(1L);
        verify(enrollmentRepository).findByStudent(testStudent);
    }

    @Test
    @DisplayName("Should return 404 when student not found")
    void getEnrollmentsByStudent_StudentNotFound() throws Exception {
        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/enrollments/student/999"))
                .andExpect(status().isNotFound());

        verify(studentRepository).findById(999L);
        verifyNoInteractions(enrollmentRepository);
    }

    @Test
    @DisplayName("Should create enrollment successfully")
    void createEnrollment_Success() throws Exception {
        EnrollmentDto requestDto = new EnrollmentDto(
            null, 1L, 1L, null, null, null, null, "tuesday", "14:00", "16:00", "B105"
        );

        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(enrollmentRepository.hasTimeConflict(testStudent, "tuesday", "14:00", "16:00"))
            .thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(testEnrollment);

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName").value("Alice Chen"))
                .andExpect(jsonPath("$.classTitle").value("Advanced Mathematics"));

        verify(studentRepository).findById(1L);
        verify(classRepository).findById(1L);
        verify(enrollmentRepository).hasTimeConflict(testStudent, "tuesday", "14:00", "16:00");
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    @DisplayName("Should return 400 when student not found during enrollment creation")
    void createEnrollment_StudentNotFound() throws Exception {
        EnrollmentDto requestDto = new EnrollmentDto(
            null, 999L, 1L, null, null, null, null, "tuesday", "14:00", "16:00", "B105"
        );

        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Student not found with ID: 999")));

        verify(studentRepository).findById(999L);
        verifyNoInteractions(classRepository, enrollmentRepository);
    }

    @Test
    @DisplayName("Should return 400 when class not found during enrollment creation")
    void createEnrollment_ClassNotFound() throws Exception {
        EnrollmentDto requestDto = new EnrollmentDto(
            null, 1L, 999L, null, null, null, null, "tuesday", "14:00", "16:00", "B105"
        );

        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(classRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Class not found with ID: 999")));

        verify(studentRepository).findById(1L);
        verify(classRepository).findById(999L);
    }

    @Test
    @DisplayName("Should return 409 when time conflict exists")
    void createEnrollment_TimeConflict() throws Exception {
        EnrollmentDto requestDto = new EnrollmentDto(
            null, 1L, 1L, null, null, null, null, "monday", "08:30", "10:30", "B105"
        );

        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(enrollmentRepository.hasTimeConflict(testStudent, "monday", "08:30", "10:30"))
            .thenReturn(true);

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Schedule conflict")));

        verify(enrollmentRepository).hasTimeConflict(testStudent, "monday", "08:30", "10:30");
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return 409 when duplicate enrollment occurs")
    void createEnrollment_DuplicateEnrollment() throws Exception {
        EnrollmentDto requestDto = new EnrollmentDto(
            null, 1L, 1L, null, null, null, null, "tuesday", "14:00", "16:00", "B105"
        );

        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(enrollmentRepository.hasTimeConflict(testStudent, "tuesday", "14:00", "16:00"))
            .thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class)))
            .thenThrow(new DataIntegrityViolationException("unique constraint"));

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Student already enrolled in this exact time slot")));

        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    @DisplayName("Should delete enrollment successfully")
    void deleteEnrollment_Success() throws Exception {
        when(enrollmentRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/enrollments/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Enrollment deleted successfully"));

        verify(enrollmentRepository).existsById(1L);
        verify(enrollmentRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent enrollment")
    void deleteEnrollment_NotFound() throws Exception {
        when(enrollmentRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/enrollments/999")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(enrollmentRepository).existsById(999L);
        verify(enrollmentRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should validate enrollment DTO fields")
    void createEnrollment_ValidationErrors() throws Exception {
        EnrollmentDto invalidDto = new EnrollmentDto(
            null, 1L, 1L, null, null, null, null, "invalidday", "25:00", "26:00", ""
        );

        mockMvc.perform(post("/api/enrollments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }
}