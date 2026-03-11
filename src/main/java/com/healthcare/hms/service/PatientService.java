package com.healthcare.hms.service;

import com.healthcare.hms.dto.PatientDto;
import com.healthcare.hms.exception.ResourceNotFoundException;
import com.healthcare.hms.model.PatientProfile;
import com.healthcare.hms.model.User;
import com.healthcare.hms.repository.PatientProfileRepository;
import com.healthcare.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    public PatientProfile getPatientProfile(Long userId) {
        return patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));
    }

    @Transactional
    public PatientProfile updatePatientProfile(Long userId, PatientDto patientDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        PatientProfile profile = patientProfileRepository.findByUserId(userId).orElse(new PatientProfile());

        if (profile.getId() == null) {
            profile.setUser(user);
        }

        profile.setBloodGroup(patientDto.getBloodGroup());
        profile.setContactNumber(patientDto.getContactNumber());
        profile.setAddress(patientDto.getAddress());
        profile.setMedicalHistory(patientDto.getMedicalHistory());
        profile.setAllergies(patientDto.getAllergies());

        return patientProfileRepository.save(profile);
    }
}
