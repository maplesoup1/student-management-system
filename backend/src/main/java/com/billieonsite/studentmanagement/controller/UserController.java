package com.billieonsite.studentmanagement.controller;

import com.billieonsite.studentmanagement.dto.UserDto;
import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
            .map(user -> new UserDto(user.getId(), user.getUsername(), user.getRole()))
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
            userDto.getPassword(),
            userDto.getRole()
        );

        User savedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
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
            user.setPassword(userDto.getPassword());
        }
        user.setRole(userDto.getRole());

        User updatedUser = userRepository.save(user);
        
        UserDto responseDto = new UserDto(
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getRole()
        );
        
        return ResponseEntity.ok(responseDto);
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