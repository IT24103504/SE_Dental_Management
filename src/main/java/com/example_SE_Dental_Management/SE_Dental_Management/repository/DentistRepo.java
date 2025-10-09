package com.example.Dental_Management.Repository;


import com.example.Dental_Management.Entity.Dentist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DentistRepo extends JpaRepository<Dentist, Long> {
    Optional<Dentist> findByName(String name);
    boolean existsByName(String name);
}
