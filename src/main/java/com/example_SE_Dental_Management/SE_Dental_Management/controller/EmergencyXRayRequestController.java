package com.xraylab.controller;

import com.xraylab.model.EmergencyXRayRequest;
import com.xraylab.repository.EmergencyXRayRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency-requests")
@CrossOrigin(origins = "*")
public class EmergencyXRayRequestController {

    private final EmergencyXRayRequestRepository repository;
    private static final String UPLOAD_DIR = "uploads/emergency/";

    public EmergencyXRayRequestController(EmergencyXRayRequestRepository repository) {
        this.repository = repository;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @GetMapping
    public List<EmergencyXRayRequest> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<String> createEmergencyRequest(
            @RequestParam String patientName,
            @RequestParam String type,
            @RequestParam(required = false) String notes,
            @RequestParam MultipartFile image, // Image is REQUIRED
            @RequestParam String createdBy) {

        try {
            // Validate required fields
            if (patientName == null || patientName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Patient name is required");
            }
            if (type == null || type.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("X-ray type is required");
            }
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body("X-ray image is required for emergency requests");
            }

            // Process the REQUIRED image
            String fileName = image.getOriginalFilename();

            // Validate file name and extension
            if (fileName == null || fileName.lastIndexOf(".") == -1) {
                return ResponseEntity.badRequest().body("Invalid file name");
            }

            String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

            if (!List.of("jpg", "jpeg", "png", "dcm").contains(ext)) {
                return ResponseEntity.badRequest().body("Invalid file type. Allowed types: JPG, JPEG, PNG, DCM");
            }

            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size exceeds 10MB limit");
            }

            // Create unique file name and save
            String newFileName = UUID.randomUUID() + "_" + fileName;
            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, image.getBytes());
            String imagePath = "/uploads/emergency/" + newFileName;

            // Create and save emergency request
            EmergencyXRayRequest request = new EmergencyXRayRequest();
            request.setPatientName(patientName.trim());
            request.setType(type.trim());
            request.setNotes(notes != null ? notes.trim() : null);
            request.setImagePath(imagePath); // This will always have a value now
            request.setCreatedBy(createdBy != null ? createdBy.trim() : "Lab Assistant");
            request.setStatus("Pending");

            repository.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Emergency request created successfully");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File upload failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating emergency request: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        try {
            repository.delete(id);
            return ResponseEntity.ok("Emergency request deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting emergency request: " + e.getMessage());
        }
    }
}