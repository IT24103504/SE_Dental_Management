package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Appointment;
import com.example.Dental_Management.Repository.ReceptionistRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReceptionistServiceIml implements ReceptionistService {

    @Autowired
    private ReceptionistRepo receptionistRepository;

    @Override
    public List<Appointment> getAllAppointments() {
        return receptionistRepository.findAll();
    }

    @Override
    public Appointment saveAppointment(Appointment appointment) {
        return receptionistRepository.save(appointment);
    }

    @Override
    public List<String> getAllDentistNames() {
        return receptionistRepository.findDistinctDentistNames();
    }

    @Override
    public List<String> getPatientNamesByDentist(String dentistName) {
        return receptionistRepository.findPatientNamesByDentistName(dentistName);
    }

    @Override
    public Map<String, Object> getAppointmentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAppointments", receptionistRepository.count());
        stats.put("confirmedAppointments", receptionistRepository.countByStatus("CONFIRMED"));
        stats.put("pendingAppointments", receptionistRepository.countByStatus("PENDING"));
        return stats;
    }

    @Override
    public Map<String, List<String>> getPatientsGroupedByDentist() {
        List<String> dentists = receptionistRepository.findDistinctDentistNames();
        Map<String, List<String>> groupedData = new HashMap<>();

        for (String dentist : dentists) {
            List<String> patients = receptionistRepository.findPatientNamesByDentistName(dentist);
            groupedData.put(dentist, patients);
        }

        return groupedData;
    }
}
