package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Alert;
import java.util.List;

public interface AlertService {
    List<Alert> getAllAlerts();
    Alert saveAlert(Alert alert);
    Alert sendAlert(String dentistName, String message, List<String> patientNames);
}
