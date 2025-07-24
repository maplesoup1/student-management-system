package com.billieonsite.studentmanagement.validation;

import com.billieonsite.studentmanagement.dto.EnrollmentDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class TimeRangeValidator implements ConstraintValidator<ValidTimeRange, EnrollmentDto> {
    
    @Override
    public void initialize(ValidTimeRange constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(EnrollmentDto dto, ConstraintValidatorContext context) {
        if (dto == null || dto.getStartTime() == null || dto.getEndTime() == null) {
            return true; // Let @NotBlank handle null checks
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("H:mm");
            LocalTime startTime = LocalTime.parse(dto.getStartTime(), formatter);
            LocalTime endTime = LocalTime.parse(dto.getEndTime(), formatter);
            
            if (!startTime.isBefore(endTime)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Start time (" + dto.getStartTime() + ") must be before end time (" + dto.getEndTime() + ")")
                    .addPropertyNode("startTime")
                    .addConstraintViolation();
                return false;
            }
            
            // Check minimum duration (at least 30 minutes)
            if (startTime.plusMinutes(30).isAfter(endTime)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Class duration must be at least 30 minutes")
                    .addPropertyNode("endTime")
                    .addConstraintViolation();
                return false;
            }
            
            return true;
            
        } catch (DateTimeParseException e) {
            // Let @Pattern handle format validation
            return true;
        }
    }
}