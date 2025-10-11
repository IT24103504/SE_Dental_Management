package com.example.demo.Controller;

import com.example.demo.Entity.User;
import com.example.demo.Entity.Appointment;
import com.example.demo.Service.UserService;
import com.example.demo.Service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        return "registration";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") User user,
                               BindingResult result, Model model) {
        if (result.hasErrors()) {
            return "registration";
        }

        try {
            userService.registerUser(user);
            model.addAttribute("success", "Registration successful! Please login.");
            return "redirect:/login";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "registration";
        }
    }

    @GetMapping("/profile/{id}")
    public String showUserProfile(@PathVariable Long id, Model model) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's appointments
        List<Appointment> appointments = appointmentService.getAppointmentsByUserId(id);

        model.addAttribute("user", user);
        model.addAttribute("appointments", appointments);
        return "profile";
    }

    @GetMapping("/edit/{id}")
    public String showEditProfileForm(@PathVariable Long id, Model model) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        model.addAttribute("user", user);
        return "edit-profile";
    }

    @PostMapping("/update/{id}")
    public String updateUserProfile(@PathVariable Long id,
                                    @Valid @ModelAttribute("user") User userDetails,
                                    BindingResult result,
                                    Model model) {

        System.out.println("CONTROLLER: Update called for user ID: " + id);

        if (result.hasErrors()) {
            System.out.println("CONTROLLER: Validation errors found");
            return "edit-profile";
        }

        try {
            User updatedUser = userService.updateUser(id, userDetails);
            System.out.println("CONTROLLER: Update successful");
            model.addAttribute("success", "Profile updated successfully!");
            return "redirect:/users/profile/" + id;
        } catch (RuntimeException e) {
            System.out.println("CONTROLLER: Update error: " + e.getMessage());
            model.addAttribute("error", e.getMessage());

            // Re-populate user data for the form
            User existingUser = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            model.addAttribute("user", existingUser);
            return "edit-profile";
        }
    }

    @PostMapping("/api/update/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateUserProfileApi(
            @PathVariable Long id,
            @RequestBody User userDetails) {

        Map<String, Object> response = new HashMap<>();

        System.out.println("API: Update called for user ID: " + id);

        try {
            User updatedUser = userService.updateUser(id, userDetails);
            System.out.println("API: Update successful");
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("API: Update error: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}