package com.example.Dental_Management.Controller;

import com.example.Dental_Management.Entity.Dentist;
import com.example.Dental_Management.Service.DentistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dentists")
public class DentistController {

    @Autowired
    private DentistService dentistService;

    @GetMapping
    public List<Dentist> getAllDentists() {
        return dentistService.getAllDentists();
    }

    @PostMapping
    public Dentist createDentist(@RequestBody Dentist dentist) {
        return dentistService.saveDentist(dentist);
    }

    @GetMapping("/{name}")
    public Dentist getDentistByName(@PathVariable String name) {
        return dentistService.getDentistByName(name);
    }
}
