package com.healthcare.hms.service;

import com.healthcare.hms.dto.DoctorDto;
import com.healthcare.hms.dto.DoctorResponseDto;
import com.healthcare.hms.exception.ResourceNotFoundException;
import com.healthcare.hms.model.DoctorProfile;
import com.healthcare.hms.model.User;
import com.healthcare.hms.repository.DoctorProfileRepository;
import com.healthcare.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;

    public DoctorResponseDto getDoctorProfile(Long userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));
        return mapToDto(profile);
    }

    @Transactional
    public DoctorProfile updateDoctorProfile(Long userId, DoctorDto doctorDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        DoctorProfile profile = doctorProfileRepository.findByUserId(userId).orElse(new DoctorProfile());

        if (profile.getId() == null) {
            profile.setUser(user);
        }

        profile.setSpecialization(doctorDto.getSpecialization());
        profile.setQualification(doctorDto.getQualification());
        profile.setContactNumber(doctorDto.getContactNumber());

        return doctorProfileRepository.save(profile);
    }

    public List<DoctorResponseDto> getAllDoctors() {
        return doctorProfileRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private DoctorResponseDto mapToDto(DoctorProfile profile) {
        return DoctorResponseDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getFirstName() + " " + profile.getUser().getLastName())
                .role(profile.getUser().getRole().name())
                .specialization(profile.getSpecialization())
                .qualification(profile.getQualification())
                .contactNumber(profile.getContactNumber())
                .build();
    }
}
