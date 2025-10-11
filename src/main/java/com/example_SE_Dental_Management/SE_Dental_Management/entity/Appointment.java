package com.example.demo.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient name is required")
    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be less than 120")
    @Column(name = "patient_age", nullable = false)
    private Integer age;

    @NotBlank(message = "Gender is required")
    @Column(name = "patient_gender", nullable = false)
    private String gender;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(name = "patient_email", nullable = false)
    private String patientEmail;

    @NotBlank(message = "Phone number is required")
    
    @Column(name = "patient_phone", nullable = false)
    private String patientPhone;

    @NotBlank(message = "Dentist name is required")
    @Column(name = "dentist_name", nullable = false)
    private String dentistName;

    @Column(name = "doctor_id")
    private String doctorId;

    @Column(name = "specialization")
    private String specialization;

    @NotNull(message = "Appointment date is required")
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @NotBlank(message = "Preferred time is required")
    @Column(name = "preferred_time", nullable = false)
    private String preferredTime;

    @Column(name = "appointment_notes", length = 500)
    private String appointmentNotes;

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDate createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    // Constructors
    public Appointment() {
        this.createdAt = LocalDate.now();
        this.status = "PENDING";
    }

    public Appointment(String patientName, Integer age, String gender, String patientEmail,
                       String patientPhone, String dentistName, LocalDate appointmentDate,
                       String preferredTime, String status) {
        this();
        this.patientName = patientName;
        this.age = age;
        this.gender = gender;
        this.patientEmail = patientEmail;
        this.patientPhone = patientPhone;
        this.dentistName = dentistName;
        this.appointmentDate = appointmentDate;
        this.preferredTime = preferredTime;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getDentistName() { return dentistName; }
    public void setDentistName(String dentistName) { this.dentistName = dentistName; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

    public String getAppointmentNotes() { return appointmentNotes; }
    public void setAppointmentNotes(String appointmentNotes) { this.appointmentNotes = appointmentNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}