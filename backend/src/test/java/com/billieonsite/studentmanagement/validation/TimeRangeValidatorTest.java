package com.billieonsite.studentmanagement.validation;

import com.billieonsite.studentmanagement.dto.EnrollmentDto;
import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TimeRangeValidatorTest {

    private TimeRangeValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    @BeforeEach
    void setUp() {
        validator = new TimeRangeValidator();
        when(context.buildConstraintViolationWithTemplate(any(String.class)))
            .thenReturn(violationBuilder);
        when(violationBuilder.addConstraintViolation()).thenReturn(context);
    }

    @Test
    @DisplayName("Should validate correct time range")
    void isValid_CorrectTimeRange() {
        EnrollmentDto dto = createEnrollmentDto("08:00", "10:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should validate minimal time range (1 minute)")
    void isValid_MinimalTimeRange() {
        EnrollmentDto dto = createEnrollmentDto("08:00", "08:01");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should validate maximum time range (24 hours)")
    void isValid_MaximumTimeRange() {
        EnrollmentDto dto = createEnrollmentDto("00:00", "23:59");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should reject when start time equals end time")
    void isValid_StartTimeEqualsEndTime() {
        EnrollmentDto dto = createEnrollmentDto("08:00", "08:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should reject when start time is after end time")
    void isValid_StartTimeAfterEndTime() {
        EnrollmentDto dto = createEnrollmentDto("10:00", "08:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should reject when start time crosses midnight")
    void isValid_StartTimeCrossesMidnight() {
        EnrollmentDto dto = createEnrollmentDto("23:00", "01:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should handle null start time")
    void isValid_NullStartTime() {
        EnrollmentDto dto = createEnrollmentDto(null, "10:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should handle null end time")
    void isValid_NullEndTime() {
        EnrollmentDto dto = createEnrollmentDto("08:00", null);
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should handle both null times")
    void isValid_BothTimesNull() {
        EnrollmentDto dto = createEnrollmentDto(null, null);
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should handle invalid time format")
    void isValid_InvalidTimeFormat() {
        EnrollmentDto dto = createEnrollmentDto("25:00", "10:00");
        
        boolean isValid = validator.isValid(dto, context);
        
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should handle edge case times")
    void isValid_EdgeCaseTimes() {
        // Test midnight start
        assertThat(validator.isValid(createEnrollmentDto("00:00", "01:00"), context)).isTrue();
        
        // Test late night end
        assertThat(validator.isValid(createEnrollmentDto("22:00", "23:59"), context)).isTrue();
        
        // Test noon times
        assertThat(validator.isValid(createEnrollmentDto("12:00", "13:00"), context)).isTrue();
    }

    @Test
    @DisplayName("Should validate common class duration scenarios")
    void isValid_CommonClassDurations() {
        // 1 hour class
        assertThat(validator.isValid(createEnrollmentDto("08:00", "09:00"), context)).isTrue();
        
        // 1.5 hour class
        assertThat(validator.isValid(createEnrollmentDto("08:00", "09:30"), context)).isTrue();
        
        // 2 hour class
        assertThat(validator.isValid(createEnrollmentDto("08:00", "10:00"), context)).isTrue();
        
        // 3 hour class
        assertThat(validator.isValid(createEnrollmentDto("08:00", "11:00"), context)).isTrue();
        
        // 4 hour class
        assertThat(validator.isValid(createEnrollmentDto("08:00", "12:00"), context)).isTrue();
    }

    @Test
    @DisplayName("Should handle null enrollment DTO")
    void isValid_NullEnrollmentDto() {
        boolean isValid = validator.isValid(null, context);
        
        assertThat(isValid).isFalse();
    }

    private EnrollmentDto createEnrollmentDto(String startTime, String endTime) {
        return new EnrollmentDto(
            null, 1L, 1L, "Test Student", "test@example.com",
            "Test Class", "Test Teacher", "monday", startTime, endTime, "A101"
        );
    }
}