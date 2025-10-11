package com.example.demo.Service;

import com.example.demo.Entity.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        if (existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User updateUser(Long userId, User userDetails) {
        System.out.println("SERVICE: Updating user ID: " + userId);

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update fields if provided and different
        if (userDetails.getFullName() != null && !userDetails.getFullName().equals(existingUser.getFullName())) {
            System.out.println("Updating fullName: " + userDetails.getFullName());
            existingUser.setFullName(userDetails.getFullName());
        }

        if (userDetails.getDob() != null && !userDetails.getDob().equals(existingUser.getDob())) {
            System.out.println("Updating dob: " + userDetails.getDob());
            existingUser.setDob(userDetails.getDob());
        }

        if (userDetails.getGender() != null && !userDetails.getGender().equals(existingUser.getGender())) {
            System.out.println("Updating gender: " + userDetails.getGender());
            existingUser.setGender(userDetails.getGender());
        }

        if (userDetails.getContactNumber() != null && !userDetails.getContactNumber().equals(existingUser.getContactNumber())) {
            System.out.println("Updating contact: " + userDetails.getContactNumber());
            existingUser.setContactNumber(userDetails.getContactNumber());
        }

        // Email uniqueness check
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(existingUser.getEmail())) {
            System.out.println("Checking email uniqueness: " + userDetails.getEmail());
            if (userRepository.existsByEmailAndIdNot(userDetails.getEmail(), userId)) {
                throw new RuntimeException("Email already exists");
            }
            System.out.println("Updating email: " + userDetails.getEmail());
            existingUser.setEmail(userDetails.getEmail());
        }

        // Update username if provided and different
        if (userDetails.getUsername() != null && !userDetails.getUsername().equals(existingUser.getUsername())) {
            System.out.println("Checking username uniqueness: " + userDetails.getUsername());
            if (userRepository.existsByUsername(userDetails.getUsername()) &&
                    !userDetails.getUsername().equals(existingUser.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            System.out.println("Updating username: " + userDetails.getUsername());
            existingUser.setUsername(userDetails.getUsername());
        }

        // Update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            System.out.println("Updating password");
            existingUser.setPassword(userDetails.getPassword());
        }

        System.out.println("SERVICE: Saving updated user");
        return userRepository.save(existingUser);
    }
}