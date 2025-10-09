package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Alert;
import com.example.Dental_Management.Repository.AlertRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertServiceIml implements AlertService {

    @Autowired
    private AlertRepo alertRepository;

    @Override
    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderBySentDateDesc();
    }

    @Override
    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    @Override
    public Alert sendAlert(String dentistName, String message, List<String> patientNames) {
        String patientNamesString = String.join(", ", patientNames);
        Alert alert = new Alert(dentistName, patientNamesString, message, LocalDateTime.now());
        return alertRepository.save(alert);
    }
}
