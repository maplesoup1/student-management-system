package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.UserDto;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserDto loginDto) {
        Optional<User> user = userRepository.findByUsername(loginDto.getUsername());
        
        if (user.isPresent() && user.get().getPassword().equals(loginDto.getPassword())) {
            UserDto responseDto = new UserDto(
                user.get().getId(),
                user.get().getUsername(),
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

        User user = new User(
            registerDto.getUsername(),
            registerDto.getPassword(),
            registerDto.getRole()
        );

        User savedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}