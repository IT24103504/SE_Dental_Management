package com.example.Dental_Management.Repository;

import com.example.Dental_Management.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceptionistRepo extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDentistName(String dentistName);

    List<Appointment> findByStatus(String status);

    @Query("SELECT DISTINCT d.name FROM Dentist d")
    List<String> findDistinctDentistNames();

    @Query("SELECT a.patientName FROM Appointment a WHERE a.dentistName = :dentistName")
    List<String> findPatientNamesByDentistName(String dentistName);

    long countByStatus(String status);
}