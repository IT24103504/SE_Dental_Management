package com.xraylab.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmergencyXRayRequest {
    private int id;
    private String patientName;
    private LocalDateTime requestDate;
    private String type;
    private String status;
    private String notes;
    private String imagePath;
    private String createdBy;
}