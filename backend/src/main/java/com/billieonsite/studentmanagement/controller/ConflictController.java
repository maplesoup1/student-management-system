package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/conflicts")
public class ConflictController {

    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/check-room")
    public ResponseEntity<Map<String, Object>> checkRoomConflict(@RequestBody Map<String, Object> request) {
        try {
            String room = (String) request.get("room");
            String day = (String) request.get("day");
            String startTime = (String) request.get("startTime");
            String endTime = (String) request.get("endTime");
            Long excludeClassId = request.get("excludeClassId") != null ? 
                Long.valueOf(request.get("excludeClassId").toString()) : null;

            List<Class> allClasses = classRepository.findAll();
            List<Map<String, Object>> conflicts = new ArrayList<>();

            for (Class clazz : allClasses) {
                // Skip the class being edited
                if (excludeClassId != null && clazz.getId().equals(excludeClassId)) {
                    continue;
                }

                if (hasRoomConflict(clazz.getSchedule(), room, day, startTime, endTime)) {
                    Map<String, Object> conflict = new HashMap<>();
                    conflict.put("classId", clazz.getId());
                    conflict.put("classTitle", clazz.getTitle());
                    conflict.put("teacherName", clazz.getTeacher() != null ? clazz.getTeacher().getName() : "Unknown");
                    conflicts.add(conflict);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("hasConflict", !conflicts.isEmpty());
            response.put("conflicts", conflicts);
            response.put("message", conflicts.isEmpty() ? 
                "Room is available" : 
                "Room conflict detected with " + conflicts.size() + " class(es)");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error checking room conflict: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/check-teacher")
    public ResponseEntity<Map<String, Object>> checkTeacherConflict(@RequestBody Map<String, Object> request) {
        try {
            Long teacherId = Long.valueOf(request.get("teacherId").toString());
            String day = (String) request.get("day");
            String startTime = (String) request.get("startTime");
            String endTime = (String) request.get("endTime");
            Long excludeClassId = request.get("excludeClassId") != null ? 
                Long.valueOf(request.get("excludeClassId").toString()) : null;

            Teacher teacher = teacherRepository.findById(teacherId).orElse(null);
            if (teacher == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Teacher not found");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            List<Class> teacherClasses = classRepository.findByTeacher(teacher);
            List<Map<String, Object>> conflicts = new ArrayList<>();

            for (Class clazz : teacherClasses) {
                // Skip the class being edited
                if (excludeClassId != null && clazz.getId().equals(excludeClassId)) {
                    continue;
                }

                if (hasTimeConflict(clazz.getSchedule(), day, startTime, endTime)) {
                    Map<String, Object> conflict = new HashMap<>();
                    conflict.put("classId", clazz.getId());
                    conflict.put("classTitle", clazz.getTitle());
                    conflicts.add(conflict);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("hasConflict", !conflicts.isEmpty());
            response.put("conflicts", conflicts);
            response.put("message", conflicts.isEmpty() ? 
                "Teacher is available" : 
                "Teacher has time conflict with " + conflicts.size() + " class(es)");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error checking teacher conflict: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    private boolean hasRoomConflict(String scheduleJson, String targetRoom, String targetDay, 
                                   String targetStartTime, String targetEndTime) {
        try {
            JsonNode schedule = objectMapper.readTree(scheduleJson);
            JsonNode daySchedule = schedule.get(targetDay.toLowerCase());
            
            if (daySchedule == null || !daySchedule.isArray()) {
                return false;
            }

            LocalTime targetStart = LocalTime.parse(targetStartTime, DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime targetEnd = LocalTime.parse(targetEndTime, DateTimeFormatter.ofPattern("HH:mm"));

            for (JsonNode timeSlot : daySchedule) {
                String room = timeSlot.get("room").asText();
                String startTime = timeSlot.get("start").asText();
                String endTime = timeSlot.get("end").asText();

                // Check if same room
                if (!room.equalsIgnoreCase(targetRoom)) {
                    continue;
                }

                LocalTime slotStart = LocalTime.parse(startTime, DateTimeFormatter.ofPattern("HH:mm"));
                LocalTime slotEnd = LocalTime.parse(endTime, DateTimeFormatter.ofPattern("HH:mm"));

                // Check for time overlap
                if (targetStart.isBefore(slotEnd) && targetEnd.isAfter(slotStart)) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            System.err.println("Error parsing schedule for room conflict: " + e.getMessage());
            return false;
        }
    }

    private boolean hasTimeConflict(String scheduleJson, String targetDay, 
                                   String targetStartTime, String targetEndTime) {
        try {
            JsonNode schedule = objectMapper.readTree(scheduleJson);
            JsonNode daySchedule = schedule.get(targetDay.toLowerCase());
            
            if (daySchedule == null || !daySchedule.isArray()) {
                return false;
            }

            LocalTime targetStart = LocalTime.parse(targetStartTime, DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime targetEnd = LocalTime.parse(targetEndTime, DateTimeFormatter.ofPattern("HH:mm"));

            for (JsonNode timeSlot : daySchedule) {
                String startTime = timeSlot.get("start").asText();
                String endTime = timeSlot.get("end").asText();

                LocalTime slotStart = LocalTime.parse(startTime, DateTimeFormatter.ofPattern("HH:mm"));
                LocalTime slotEnd = LocalTime.parse(endTime, DateTimeFormatter.ofPattern("HH:mm"));

                // Check for time overlap
                if (targetStart.isBefore(slotEnd) && targetEnd.isAfter(slotStart)) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            System.err.println("Error parsing schedule for time conflict: " + e.getMessage());
            return false;
        }
    }
}