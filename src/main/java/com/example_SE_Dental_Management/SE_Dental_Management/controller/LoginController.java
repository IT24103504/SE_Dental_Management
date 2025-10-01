package com.example_SE_Dental_Management.SE_Dental_Management.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    // Handles the root URL ("/") and "/index" to show the main landing page
    @GetMapping({"/", "/index"})
    public String showIndexPage() {
        return "index"; // Renders index.html
    }

    // Shows the login page
    @GetMapping("/login")
    public String showLoginPage() {
        return "login"; // Renders login.html
    }

    /**
     * Processes the login form submission.
     * In a real application, you would verify the username and password against the database.
     * For this example, we will simulate a successful login.
     */
    @PostMapping("/login")
    public String processLogin(@RequestParam String username, @RequestParam String password, HttpServletRequest request) {
        // --- IMPORTANT ---
        // In a real project, you would have a UserService to check:
        // if (userService.validateUser(username, password)) { ... }
        // For now, we will assume any login is successful.

        // Create a session to indicate the user is logged in
        HttpSession session = request.getSession(true);
        session.setAttribute("loggedInUser", username);

        // Redirect to the admin dashboard upon successful login
        return "redirect:/admin";
    }

    /**
     * Handles the logout process.
     * It invalidates the current session and redirects to the index page.
     */
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false); // Get session if it exists
        if (session != null) {
            session.invalidate(); // Invalidate the session
        }
        return "redirect:/index"; // Redirect to the index page
    }
}