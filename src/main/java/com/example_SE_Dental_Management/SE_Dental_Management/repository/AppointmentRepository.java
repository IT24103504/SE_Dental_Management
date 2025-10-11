package com.example.demo.Repository;

import com.example.demo.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientEmail(String patientEmail);
    List<Appointment> findByDentistName(String dentistName);
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByUserId(Long userId);

    @Query("SELECT a FROM Appointment a WHERE a.dentistName = :dentistName AND a.appointmentDate = :appointmentDate AND a.preferredTime = :preferredTime")
    List<Appointment> findByDentistNameAndAppointmentDateAndPreferredTime(
            @Param("dentistName") String dentistName,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("preferredTime") String preferredTime);
}