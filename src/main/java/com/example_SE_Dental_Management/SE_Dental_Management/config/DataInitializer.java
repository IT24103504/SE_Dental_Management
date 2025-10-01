package com.example_SE_Dental_Management.SE_Dental_Management.config;

import com.example_SE_Dental_Management.SE_Dental_Management.entity.User;
import com.example_SE_Dental_Management.SE_Dental_Management.repository.UserRepository;
import com.example_SE_Dental_Management.SE_Dental_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    // --- INJECT THE USER SERVICE ---
    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // Check if there are any users in the database
        if (userRepository.count() == 0) {
            // If no users exist, create a default admin user
            User adminUser = new User();
            adminUser.setFullname("Default Admin");
            adminUser.setUsername("admin");
            adminUser.setPassword("password"); // We provide the plain text password here
            adminUser.setType("Admin");
            adminUser.setEmail("admin@clinic.com");
            adminUser.setGender("Other");
            adminUser.setContact("000-000-0000");
            adminUser.setDob(LocalDate.parse("2000-01-01"));

            // --- USE THE SERVICE TO SAVE THE USER ---
            // The userService.saveUser() method will automatically hash the password before saving.
            userService.saveUser(adminUser);
            System.out.println(">>> Created default admin user with username 'admin' and HASHED password.");
        }
    }
}


