package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Dentist;
import com.example.Dental_Management.Repository.DentistRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DentistServiceIml implements DentistService {

    @Autowired
    private DentistRepo dentistRepository;

    @Override
    public List<Dentist> getAllDentists() {
        return dentistRepository.findAll();
    }

    @Override
    public Dentist saveDentist(Dentist dentist) {
        return dentistRepository.save(dentist);
    }

    @Override
    public Dentist getDentistByName(String name) {
        return dentistRepository.findByName(name).orElse(null);
    }
}