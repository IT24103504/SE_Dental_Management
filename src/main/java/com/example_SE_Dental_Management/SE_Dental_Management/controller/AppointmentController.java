package com.smilecare.controller;

import com.smilecare.model.Appointment;
import com.smilecare.repository.AppointmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;

    public AppointmentController(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping("/dentist/{dentistId}/pending")
    public List<Appointment> getPendingAppointments(@PathVariable int dentistId) {
        return appointmentRepository.findPending();
    }

    @GetMapping("/dentist/{dentistId}/upcoming")
    public List<Appointment> getUpcomingAppointments(@PathVariable int dentistId) {
        return appointmentRepository.findAccepted();
    }

    @GetMapping("/dentist/{dentistId}/recent")
    public List<Appointment> getRecentPatients(@PathVariable int dentistId) {
        return appointmentRepository.findRecent();
    }

    @GetMapping("/dentist/{dentistId}/stats")
    public Map<String, Integer> getAppointmentStats(@PathVariable int dentistId) {
        return appointmentRepository.getStats();
    }

    @GetMapping("/accepted")
    public List<Appointment> getAllAcceptedAppointments() {
        return appointmentRepository.findAllAccepted();
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<String> updateAppointmentStatus(@PathVariable String appointmentId, @RequestBody StatusUpdate statusUpdate) {
        boolean success = appointmentRepository.updateStatus(appointmentId, statusUpdate.getStatus());
        if (success) {
            // If accepting, also add to accepted appointments table
            if ("ACCEPTED".equals(statusUpdate.getStatus())) {
                appointmentRepository.addToAcceptedAppointments(appointmentId);
            }
            return ResponseEntity.ok("Appointment status updated successfully");
        }
        return ResponseEntity.badRequest().body("Failed to update appointment status");
    }

    @DeleteMapping("/accepted/{appointmentId}")
    public ResponseEntity<String> deleteAcceptedAppointment(@PathVariable String appointmentId) {
        boolean success = appointmentRepository.deleteAcceptedAppointment(appointmentId);
        if (success) {
            return ResponseEntity.ok("Accepted appointment deleted successfully");
        }
        return ResponseEntity.badRequest().body("Failed to delete accepted appointment");
    }

    public static class StatusUpdate {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}