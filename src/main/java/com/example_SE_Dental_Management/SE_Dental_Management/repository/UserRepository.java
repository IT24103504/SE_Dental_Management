package com.example_SE_Dental_Management.SE_Dental_Management.repository;

import com.example_SE_Dental_Management.SE_Dental_Management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // --- NEW METHOD NEEDED BY SPRING SECURITY ---
    Optional<User> findByUsername(String username);

    // Method for filtering in the admin dashboard
    List<User> findByType(String type);
}