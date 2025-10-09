package com.example.Dental_Management.Service;

import com.example.Dental_Management.Entity.Dentist;
import java.util.List;

public interface DentistService {
    List<Dentist> getAllDentists();
    Dentist saveDentist(Dentist dentist);
    Dentist getDentistByName(String name);
}