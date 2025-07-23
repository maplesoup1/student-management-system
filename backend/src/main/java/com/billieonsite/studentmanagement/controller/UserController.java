package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.UserDto;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.model.Role;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
            .map(user -> new UserDto(user.getId(), user.getUsername(), null, user.getRole()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            UserDto userDto = new UserDto(
                user.get().getId(),
                user.get().getUsername(),
                null,
                user.get().getRole()
            );
            return ResponseEntity.ok(userDto);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User(
            userDto.getUsername(),
            passwordEncoder.encode(userDto.getPassword()),
            userDto.getRole()
        );

        User savedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
            null,
            savedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        Optional<User> userOptional = userRepository.findById(id);
        
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        
        if (!user.getUsername().equals(userDto.getUsername()) && 
            userRepository.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        user.setUsername(userDto.getUsername());
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        user.setRole(userDto.getRole());

        User updatedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            updatedUser.getId(),
            updatedUser.getUsername(),
            null,
            updatedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleUpdate) {
        Optional<User> userOptional = userRepository.findById(id);
        
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        String newRoleStr = roleUpdate.get("role");
        
        try {
            Role newRole = Role.valueOf(newRoleStr);
            user.setRole(newRole);
            User updatedUser = userRepository.save(user);
            
            UserDto responseDto = new UserDto(
                updatedUser.getId(),
                updatedUser.getUsername(),
                null,
                updatedUser.getRole()
            );
            
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + newRoleStr);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}