package com.example.Dental_Management.Repository;

import com.example.Dental_Management.Entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepo extends JpaRepository<Alert, Long> {
    List<Alert> findAllByOrderBySentDateDesc();
}