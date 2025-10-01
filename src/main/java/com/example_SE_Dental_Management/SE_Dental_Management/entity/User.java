package com.example_SE_Dental_Management.SE_Dental_Management.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "users") // This explicitly names the table "users"
@Data // Lombok annotation to generate getters, setters, toString, etc.
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // IDENTITY lets the database handle the auto-incrementing primary key
    private Long id;

    @Column(nullable = false)
    private String fullname;

    private LocalDate dob; // Date of Birth

    private String gender;

    private String contact;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "user_type", nullable = false)
    private String type; // Maps to the "type" field from the form
}
