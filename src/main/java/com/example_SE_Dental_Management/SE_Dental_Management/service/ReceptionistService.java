package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Appointment;
import java.util.List;
import java.util.Map;

public interface ReceptionistService {
    List<Appointment> getAllAppointments();
    Appointment saveAppointment(Appointment appointment);
    List<String> getAllDentistNames();
    List<String> getPatientNamesByDentist(String dentistName);
    Map<String, Object> getAppointmentStats();
    Map<String, List<String>> getPatientsGroupedByDentist();
}