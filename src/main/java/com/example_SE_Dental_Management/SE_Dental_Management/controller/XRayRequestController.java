package com.smilecare.controller;

import com.smilecare.model.XRayRequest;
import com.smilecare.repository.XRayRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/xray-requests")
@CrossOrigin(origins = "*")
public class XRayRequestController {

    private final XRayRequestRepository repository;

    public XRayRequestController(XRayRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<String> createXRayRequest(@RequestBody XRayRequest request) {
        try {
            repository.create(request);
            return ResponseEntity.ok("X-ray request created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create X-ray request");
        }
    }

    @GetMapping
    public List<XRayRequest> getAllXRayRequests() {
        return repository.findAll();
    }
}