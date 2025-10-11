package com.example.demo.Controller;

import com.example.demo.Entity.Appointment;
import com.example.demo.Entity.User;
import com.example.demo.Service.AppointmentService;
import com.example.demo.Service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @GetMapping("/book")
    public String showBookingForm(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            // Pre-populate form with user data if logged in
            Appointment appointment = new Appointment();
            appointment.setPatientName(user.getFullName());
            appointment.setPatientEmail(user.getEmail());
            appointment.setPatientPhone(user.getContactNumber());
            appointment.setUser(user);
            model.addAttribute("appointment", appointment);
        } else {
            model.addAttribute("appointment", new Appointment());
        }
        return "booking-form";
    }

    @PostMapping("/book")
    public String bookAppointment(@Valid @ModelAttribute("appointment") Appointment appointment,
                                  BindingResult result,
                                  HttpSession session,
                                  Model model) {
        if (result.hasErrors()) {
            return "booking-form";
        }

        try {
            // Set default status
            appointment.setStatus("PENDING");

            // Set user if logged in
            User user = (User) session.getAttribute("user");
            if (user != null) {
                appointment.setUser(user);
            }

            Appointment savedAppointment = appointmentService.bookAppointment(appointment);
            model.addAttribute("success", true);
            model.addAttribute("appointment", savedAppointment);
            return "booking-success";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "booking-form";
        }
    }

    @PostMapping("/api/book")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> bookAppointmentApi(@Valid @RequestBody Appointment appointment, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            appointment.setStatus("PENDING");

            // Set user if logged in
            User user = (User) session.getAttribute("user");
            if (user != null) {
                appointment.setUser(user);
            }

            Appointment savedAppointment = appointmentService.bookAppointment(appointment);

            response.put("success", true);
            response.put("appointment", savedAppointment);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/history/{userId}")
    public String getAppointmentHistory(@PathVariable Long userId, Model model) {
        List<Appointment> appointments = appointmentService.getAppointmentsByUserId(userId);
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("appointments", appointments);
        model.addAttribute("user", user);
        return "appointment-history";
    }

    @PostMapping("/cancel/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            appointmentService.cancelAppointment(id);
            response.put("success", true);
            response.put("message", "Appointment cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/available-slots")
    @ResponseBody
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam String dentistName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String time) {

        boolean isAvailable = appointmentService.isTimeSlotAvailable(dentistName, date, time);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }
}