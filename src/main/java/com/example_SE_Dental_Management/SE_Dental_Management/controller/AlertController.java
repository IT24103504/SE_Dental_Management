package com.example.Dental_Management.Controller;

import com.example.Dental_Management.Entity.Alert;
import com.example.Dental_Management.Service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @PostMapping
    public Alert createAlert(@RequestBody Alert alert) {
        return alertService.saveAlert(alert);
    }

    @PostMapping("/send")
    public ResponseEntity<Alert> sendAlert(@RequestBody Map<String, Object> alertRequest) {
        String dentistName = (String) alertRequest.get("dentistName");
        String message = (String) alertRequest.get("message");
        List<String> patientNames = (List<String>) alertRequest.get("patientNames");

        Alert alert = alertService.sendAlert(dentistName, message, patientNames);
        return ResponseEntity.ok(alert);
    }
}
