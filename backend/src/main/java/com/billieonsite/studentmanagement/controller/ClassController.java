package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.model.Class;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "http://localhost:3000")
public class ClassController {
    
    private List<Class> classes = new ArrayList<>();
    private Long nextId = 1L;

    @PostMapping
    public Class createClass(@RequestBody Class newClass) {
        newClass.setId(nextId++);
        classes.add(newClass);
        return newClass;
    }

    @GetMapping
    public List<Class> getAllClasses() {
        return classes;
    }

    @GetMapping("/{id}")
    public Class getClass(@PathVariable Long id) {
        return classes.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}