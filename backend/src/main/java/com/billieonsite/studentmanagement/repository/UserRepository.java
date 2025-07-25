package com.billieonsite.studentmanagement.repository;

import com.billieonsite.studentmanagement.model.User;
import com.billieonsite.studentmanagement.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByRole(Role role);
    long countByRole(Role role);
}