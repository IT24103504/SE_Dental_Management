package com.example_SE_Dental_Management.SE_Dental_Management.controller;

import com.example_SE_Dental_Management.SE_Dental_Management.entity.User;
import com.example_SE_Dental_Management.SE_Dental_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class AdminController {

    @Autowired
    private UserService userService;

    // This method serves the main admin dashboard page
    @GetMapping("/admin")
    public String adminDashboard() {
        return "admin"; // This returns 'admin.html' from src/main/resources/templates
    }

    // --- REST API for User Management ---
    @RestController
    @RequestMapping("/api/users")
    class UserApiController {

        // READ: Get all users, with optional filtering by type
        @GetMapping
        public List<User> getAllUsers(@RequestParam(required = false) String type) {
            // This correctly calls the service
            return userService.getAllUsers(type);
        }

        // --- THIS IS THE CORRECTED METHOD ---
        // READ: Get a single user by ID (for editing)
        @GetMapping("/{id}")
        public ResponseEntity<User> getUserById(@PathVariable Long id) {
            // We call the service, which returns an Optional<User>
            // We then use .map() on the Optional to transform the User into a ResponseEntity
            // If the Optional is empty, we return a 404 Not Found response.
            return userService.getUserById(id)
                    .map(user -> ResponseEntity.ok(user))
                    .orElse(ResponseEntity.notFound().build());
        }

        // CREATE: Add a new user
        @PostMapping
        public User createUser(@RequestBody User user) {
            return userService.saveUser(user);
        }

        // UPDATE: Modify an existing user
        @PutMapping("/{id}")
        public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
            try {
                User updatedUser = userService.updateUser(id, userDetails);
                return ResponseEntity.ok(updatedUser);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }

        // DELETE: Remove a user
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
    }
}