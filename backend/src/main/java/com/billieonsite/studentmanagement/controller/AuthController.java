package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.LoginRequest;
import com.billieonsite.studentmanagement.dto.UserDto;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.billieonsite.studentmanagement.model.Student;
import com.billieonsite.studentmanagement.repository.StudentRepository;
import com.billieonsite.studentmanagement.model.Role;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());
        
        if (user.isPresent()) {
            System.out.println("=== LOGIN DEBUG ===");
            System.out.println("Username: " + loginRequest.getUsername());
            System.out.println("Input password: " + loginRequest.getPassword());
            System.out.println("Stored password hash: " + user.get().getPassword());
            System.out.println("Password matches: " + passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword()));
            System.out.println("===================");
        }
        
        if (user.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            UserDto responseDto = new UserDto(
                user.get().getId(),
                user.get().getUsername(),
                null, // email not stored in User model
                user.get().getRole()
            );
            return ResponseEntity.ok(responseDto);
        }
        
        return ResponseEntity.badRequest().body("Invalid username or password");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDto registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Only allow STUDENT registration
        if (registerDto.getRole() != Role.STUDENT) {
            return ResponseEntity.badRequest().body("Only student registration is allowed. Teachers are created by administrators.");
        }

        User user = new User(
            registerDto.getUsername(),
            passwordEncoder.encode(registerDto.getPassword()),
            registerDto.getRole()
        );

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.STUDENT) {
            String email = registerDto.getEmail() != null ? registerDto.getEmail() : savedUser.getUsername() + "@example.com";
            Student student = new Student(savedUser.getUsername(), email);
            student.setUser(savedUser);
            Student savedStudent = studentRepository.save(student);
            System.out.println("Created student with ID: " + savedStudent.getId() + " for user ID: " + savedUser.getId());
        }
        
        UserDto responseDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
            registerDto.getEmail(),
            savedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody UserDto adminDto) {
        if (userRepository.existsByUsername(adminDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User(
            adminDto.getUsername(),
            passwordEncoder.encode(adminDto.getPassword()),
            Role.ADMIN
        );

        User savedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
            adminDto.getEmail(),
            savedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
    }
}