package com.example.demo.Service;

import com.example.demo.Entity.Appointment;
import com.example.demo.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public Appointment bookAppointment(Appointment appointment) {
        // Check if the time slot is available
        if (!isTimeSlotAvailable(appointment.getDentistName(), appointment.getAppointmentDate(), appointment.getPreferredTime())) {
            throw new RuntimeException("Selected time slot is not available for this dentist");
        }

        return appointmentRepository.save(appointment);
    }

    @Override
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public List<Appointment> getAppointmentsByPatientEmail(String email) {
        return appointmentRepository.findByPatientEmail(email);
    }

    @Override
    public List<Appointment> getAppointmentsByDentist(String dentistName) {
        return appointmentRepository.findByDentistName(dentistName);
    }

    @Override
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    @Override
    public List<Appointment> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    @Override
    public List<Appointment> getAppointmentsByUserId(Long userId) {
        return appointmentRepository.findByUserId(userId);
    }

    @Override
    public Appointment updateAppointment(Appointment appointment) {
        if (!appointmentRepository.existsById(appointment.getId())) {
            throw new RuntimeException("Appointment not found");
        }
        return appointmentRepository.save(appointment);
    }

    @Override
    public void cancelAppointment(Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus("CANCELLED");
            appointmentRepository.save(appointment);
        } else {
            throw new RuntimeException("Appointment not found");
        }
    }

    @Override
    public boolean isTimeSlotAvailable(String dentistName, LocalDate date, String time) {
        List<Appointment> existingAppointments = appointmentRepository.findByDentistNameAndAppointmentDateAndPreferredTime(
                dentistName, date, time);

        // Filter out cancelled appointments
        boolean hasActiveAppointment = existingAppointments.stream()
                .anyMatch(appt -> !"CANCELLED".equals(appt.getStatus()));

        return !hasActiveAppointment;
    }
}