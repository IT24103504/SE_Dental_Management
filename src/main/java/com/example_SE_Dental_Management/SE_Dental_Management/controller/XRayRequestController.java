package com.xraylab.controller;

import com.xraylab.model.XRayRequest;
import com.xraylab.repository.XRayRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class XRayRequestController {

    private final XRayRequestRepository repository;
    private static final String UPLOAD_DIR = "uploads/";

    public XRayRequestController(XRayRequestRepository repository) {
        this.repository = repository;
        new File(UPLOAD_DIR).mkdirs();
    }

    @GetMapping("/pending")
    public List<XRayRequest> getPending() {
        return repository.findPending();
    }

    // NEW: Add endpoint for processed requests
    @GetMapping("/processed")
    public List<XRayRequest> getProcessed() {
        return repository.findProcessed();
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody XRayRequest request) {
        repository.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Request created");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable int id,
                                         @RequestParam(required = false) MultipartFile image,
                                         @RequestParam(required = false) String notes,
                                         @RequestParam(required = false) String status) {
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, image.getBytes());
                imagePath = "/uploads/" + fileName;

                String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                if (!List.of("jpg", "jpeg", "png", "dcm").contains(ext)) {
                    return ResponseEntity.badRequest().body("Invalid file type");
                }
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
            }
        }

        String finalStatus = (status != null) ? status : "Processed";
        repository.update(id, notes, finalStatus, imagePath);

        return ResponseEntity.ok("Request updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        repository.delete(id);
        return ResponseEntity.ok("Request deleted");
    }
}