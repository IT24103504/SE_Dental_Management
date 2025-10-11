package com.example.demo.Service;

import com.example.demo.Entity.Appointment;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentService {
    Appointment bookAppointment(Appointment appointment);
    Optional<Appointment> getAppointmentById(Long id);
    List<Appointment> getAllAppointments();
    List<Appointment> getAppointmentsByPatientEmail(String email);
    List<Appointment> getAppointmentsByDentist(String dentistName);
    List<Appointment> getAppointmentsByDate(LocalDate date);
    List<Appointment> getAppointmentsByStatus(String status);
    List<Appointment> getAppointmentsByUserId(Long userId);
    Appointment updateAppointment(Appointment appointment);
    void cancelAppointment(Long id);
    boolean isTimeSlotAvailable(String dentistName, LocalDate date, String time);
}