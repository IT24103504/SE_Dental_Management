package com.example.Dental_Management.Controller;

import com.example.Dental_Management.Entity.Appointment;
import com.example.Dental_Management.Service.ReceptionistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")

public class ReceptionistController {

    @Autowired
    private ReceptionistService receptionistService;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return receptionistService.getAllAppointments();
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return receptionistService.saveAppointment(appointment);
    }

    @GetMapping("/dentists")
    public List<String> getAllDentistNames() {
        return receptionistService.getAllDentistNames();
    }

    @GetMapping("/patients/{dentistName}")
    public List<String> getPatientsByDentist(@PathVariable String dentistName) {
        return receptionistService.getPatientNamesByDentist(dentistName);
    }

    @GetMapping("/stats")
    public Map<String, Object> getAppointmentStats() {
        return receptionistService.getAppointmentStats();
    }

    @GetMapping("/grouped")
    public Map<String, List<String>> getPatientsGroupedByDentist() {
        return receptionistService.getPatientsGroupedByDentist();
    }
}

