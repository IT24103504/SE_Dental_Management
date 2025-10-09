package com.example.Dental_Management.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(name = "dentist_name", nullable = false)
    private String dentistName;

    @Column(name = "patient_names", nullable = false, length = 2000)
    private String patientNames;

    @NotBlank(message = "Message is required")
    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "sent_date", nullable = false)
    private LocalDateTime sentDate;


    public Alert() {}


    public Alert(String dentistName, String patientNamesString, String message, LocalDateTime now) {
        this.dentistName = dentistName;
        this.patientNames = patientNamesString;
        this.message = message;
        this.sentDate = now;
    }

    public Alert(Long id, String dentistName, String patientNames, String message, LocalDateTime sentDate) {
        this.id = id;
        this.dentistName = dentistName;
        this.patientNames = patientNames;
        this.message = message;
        this.sentDate = sentDate;
    }

    @PrePersist
    protected void onCreate() {
        if (this.sentDate == null) {
            this.sentDate = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDentistName() {
        return dentistName;
    }

    public void setDentistName(String dentistName) {
        this.dentistName = dentistName;
    }

    public String getPatientNames() {
        return patientNames;
    }

    public void setPatientNames(String patientNames) {
        this.patientNames = patientNames;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDateTime sentDate) {
        this.sentDate = sentDate;
    }

    @Override
    public String toString() {
        return "Alert{" +
                "id=" + id +
                ", dentistName='" + dentistName + '\'' +
                ", patientNames='" + patientNames + '\'' +
                ", message='" + message + '\'' +
                ", sentDate=" + sentDate +
                '}';
    }
}
