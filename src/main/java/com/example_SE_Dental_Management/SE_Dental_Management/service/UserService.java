package com.example.demo.Service;

import com.example.demo.Entity.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(User user);
    Optional<User> getUserById(Long id);
    Optional<User> getUserByUsername(String username);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUser(Long userId, User userDetails);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void deleteUser(Long id);
}