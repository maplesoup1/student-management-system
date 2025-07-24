package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.ClassDto;
import com.billieonsite.studentmanagement.model.Class;
import com.billieonsite.studentmanagement.model.Teacher;
import com.billieonsite.studentmanagement.repository.ClassRepository;
import com.billieonsite.studentmanagement.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<List<ClassDto>> getAllClasses() {
        List<Class> classes = classRepository.findAll();
        List<ClassDto> classDtos = classes.stream()
            .map(clazz -> {
                Object schedule = clazz.getSchedule();
                // If schedule is stored as a string, try to parse it as JSON
                if (schedule instanceof String) {
                    try {
                        schedule = objectMapper.readValue((String) schedule, Object.class);
                    } catch (Exception e) {
                        System.err.println("Error parsing schedule JSON for class " + clazz.getId() + ": " + e.getMessage());
                        // Keep as string if parsing fails
                    }
                }
                
                return new ClassDto(
                    clazz.getId(),
                    clazz.getTitle(),
                    schedule,
                    clazz.getSubject(),
                    clazz.getTeacher() != null ? clazz.getTeacher().getId() : null,
                    clazz.getTeacher() != null ? clazz.getTeacher().getName() : null
                );
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(classDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassDto> getClassById(@PathVariable Long id) {
        Optional<Class> clazz = classRepository.findById(id);
        if (clazz.isPresent()) {
            Class c = clazz.get();
            Object schedule = c.getSchedule();
            // If schedule is stored as a string, try to parse it as JSON
            if (schedule instanceof String) {
                try {
                    schedule = objectMapper.readValue((String) schedule, Object.class);
                } catch (Exception e) {
                    System.err.println("Error parsing schedule JSON for class " + c.getId() + ": " + e.getMessage());
                    // Keep as string if parsing fails
                }
            }
            
            ClassDto classDto = new ClassDto(
                c.getId(),
                c.getTitle(),
                schedule,
                c.getSubject(),
                c.getTeacher() != null ? c.getTeacher().getId() : null,
                c.getTeacher() != null ? c.getTeacher().getName() : null
            );
            return ResponseEntity.ok(classDto);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassDto>> getClassesByTeacher(@PathVariable Long teacherId) {
        Optional<Teacher> teacher = teacherRepository.findById(teacherId);
        if (!teacher.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Class> classes = classRepository.findByTeacher(teacher.get());
        List<ClassDto> classDtos = classes.stream()
            .map(clazz -> {
                Object schedule = clazz.getSchedule();
                // If schedule is stored as a string, try to parse it as JSON
                if (schedule instanceof String) {
                    try {
                        schedule = objectMapper.readValue((String) schedule, Object.class);
                    } catch (Exception e) {
                        System.err.println("Error parsing schedule JSON for class " + clazz.getId() + ": " + e.getMessage());
                        // Keep as string if parsing fails
                    }
                }
                
                return new ClassDto(
                    clazz.getId(),
                    clazz.getTitle(),
                    schedule,
                    clazz.getSubject(),
                    clazz.getTeacher().getId(),
                    clazz.getTeacher().getName()
                );
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(classDtos);
    }

    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody ClassDto classDto) {
        // Validate teacher exists
        if (classDto.getTeacherId() == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Teacher ID is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        Optional<Teacher> teacherOpt = teacherRepository.findById(classDto.getTeacherId());
        if (!teacherOpt.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Teacher not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        Teacher teacher = teacherOpt.get();
        
        // Convert schedule to JSON string for storage
        String scheduleJson;
        if (classDto.getSchedule() instanceof String) {
            scheduleJson = (String) classDto.getSchedule();
        } else {
            try {
                scheduleJson = objectMapper.writeValueAsString(classDto.getSchedule());
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid schedule format");
                return ResponseEntity.badRequest().body(error);
            }
        }
        
        // Check for conflicts before creating the class
        List<String> conflictErrors = checkScheduleConflicts(scheduleJson, teacher, null);
        if (!conflictErrors.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Schedule conflicts detected");
            error.put("conflicts", conflictErrors);
            return ResponseEntity.badRequest().body(error);
        }
        
        Class clazz = new Class(classDto.getTitle(), classDto.getSubject(), scheduleJson, teacher);
        Class savedClass = classRepository.save(clazz);
        
        // Parse schedule back to object for response
        Object responseSchedule = savedClass.getSchedule();
        try {
            responseSchedule = objectMapper.readValue(savedClass.getSchedule(), Object.class);
        } catch (Exception e) {
            // Keep as string if parsing fails
        }
        
        ClassDto responseDto = new ClassDto(
            savedClass.getId(),
            savedClass.getTitle(),
            responseSchedule,
            savedClass.getSubject(),
            savedClass.getTeacher().getId(),
            savedClass.getTeacher().getName()
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassDto> updateClass(@PathVariable Long id, @Valid @RequestBody ClassDto classDto) {
        Optional<Class> classOptional = classRepository.findById(id);
        
        if (!classOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Class clazz = classOptional.get();
        clazz.setTitle(classDto.getTitle());
        clazz.setSubject(classDto.getSubject());
        
        // Convert schedule to JSON string for storage
        String scheduleJson;
        if (classDto.getSchedule() instanceof String) {
            scheduleJson = (String) classDto.getSchedule();
        } else {
            try {
                scheduleJson = objectMapper.writeValueAsString(classDto.getSchedule());
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        clazz.setSchedule(scheduleJson);
        
        if (classDto.getTeacherId() != null) {
            Optional<Teacher> teacher = teacherRepository.findById(classDto.getTeacherId());
            if (teacher.isPresent()) {
                clazz.setTeacher(teacher.get());
            }
        } else {
            clazz.setTeacher(null);
        }

        Class updatedClass = classRepository.save(clazz);
        
        // Parse schedule back to object for response
        Object responseSchedule = updatedClass.getSchedule();
        try {
            responseSchedule = objectMapper.readValue(updatedClass.getSchedule(), Object.class);
        } catch (Exception e) {
            // Keep as string if parsing fails
        }
        
        ClassDto responseDto = new ClassDto(
            updatedClass.getId(),
            updatedClass.getTitle(),
            responseSchedule,
            updatedClass.getSubject(),
            updatedClass.getTeacher() != null ? updatedClass.getTeacher().getId() : null,
            updatedClass.getTeacher() != null ? updatedClass.getTeacher().getName() : null
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClass(@PathVariable Long id) {
        if (classRepository.existsById(id)) {
            classRepository.deleteById(id);
            return ResponseEntity.ok("Class deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
    
    private List<String> checkScheduleConflicts(String scheduleJson, Teacher teacher, Long excludeClassId) {
        List<String> conflicts = new ArrayList<>();
        
        try {
            JsonNode schedule = objectMapper.readTree(scheduleJson);
            String[] days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};
            
            for (String day : days) {
                JsonNode daySchedule = schedule.get(day);
                if (daySchedule == null || !daySchedule.isArray()) {
                    continue;
                }
                
                for (JsonNode timeSlot : daySchedule) {
                    String room = timeSlot.get("room").asText();
                    String startTime = timeSlot.get("start").asText();
                    String endTime = timeSlot.get("end").asText();
                    
                    // Check room conflicts
                    List<String> roomConflicts = checkRoomConflicts(room, day, startTime, endTime, excludeClassId);
                    conflicts.addAll(roomConflicts);
                    
                    // Check teacher conflicts
                    List<String> teacherConflicts = checkTeacherConflicts(teacher, day, startTime, endTime, excludeClassId);
                    conflicts.addAll(teacherConflicts);
                }
            }
        } catch (Exception e) {
            conflicts.add("Error parsing schedule: " + e.getMessage());
        }
        
        return conflicts;
    }
    
    private List<String> checkRoomConflicts(String room, String day, String startTime, String endTime, Long excludeClassId) {
        List<String> conflicts = new ArrayList<>();
        List<Class> allClasses = classRepository.findAll();
        
        LocalTime targetStart = LocalTime.parse(startTime, DateTimeFormatter.ofPattern("HH:mm"));
        LocalTime targetEnd = LocalTime.parse(endTime, DateTimeFormatter.ofPattern("HH:mm"));
        
        for (Class clazz : allClasses) {
            if (excludeClassId != null && clazz.getId().equals(excludeClassId)) {
                continue;
            }
            
            if (hasRoomConflict(clazz.getSchedule(), room, day, startTime, endTime)) {
                conflicts.add("Room " + room + " conflict on " + day + " " + startTime + "-" + endTime + 
                            " with class: " + clazz.getTitle() + " (Teacher: " + 
                            (clazz.getTeacher() != null ? clazz.getTeacher().getName() : "Unknown") + ")");
            }
        }
        
        return conflicts;
    }
    
    private List<String> checkTeacherConflicts(Teacher teacher, String day, String startTime, String endTime, Long excludeClassId) {
        List<String> conflicts = new ArrayList<>();
        List<Class> teacherClasses = classRepository.findByTeacher(teacher);
        
        for (Class clazz : teacherClasses) {
            if (excludeClassId != null && clazz.getId().equals(excludeClassId)) {
                continue;
            }
            
            if (hasTimeConflict(clazz.getSchedule(), day, startTime, endTime)) {
                conflicts.add("Teacher " + teacher.getName() + " conflict on " + day + " " + startTime + "-" + endTime + 
                            " with class: " + clazz.getTitle());
            }
        }
        
        return conflicts;
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

                if (!room.equalsIgnoreCase(targetRoom)) {
                    continue;
                }

                LocalTime slotStart = LocalTime.parse(startTime, DateTimeFormatter.ofPattern("HH:mm"));
                LocalTime slotEnd = LocalTime.parse(endTime, DateTimeFormatter.ofPattern("HH:mm"));

                if (targetStart.isBefore(slotEnd) && targetEnd.isAfter(slotStart)) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
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

                if (targetStart.isBefore(slotEnd) && targetEnd.isAfter(slotStart)) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }
}