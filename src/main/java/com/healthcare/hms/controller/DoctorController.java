package com.healthcare.hms.controller;

import com.healthcare.hms.dto.DoctorDto;
import com.healthcare.hms.dto.DoctorResponseDto;
import com.healthcare.hms.model.DoctorProfile;
import com.healthcare.hms.security.CustomUserDetails;
import com.healthcare.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDto> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        DoctorResponseDto profile = doctorService.getDoctorProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfile> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DoctorDto doctorDto) {
        DoctorProfile profile = doctorService.updateDoctorProfile(userDetails.getUser().getId(), doctorDto);
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DoctorResponseDto> getDoctorProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorService.getDoctorProfile(userId));
    }
}
