package com.healthcare.hms.controller;

import com.healthcare.hms.dto.PatientDto;
import com.healthcare.hms.model.PatientProfile;
import com.healthcare.hms.security.CustomUserDetails;
import com.healthcare.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfile> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        PatientProfile profile = patientService.getPatientProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfile> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PatientDto patientDto) {
        PatientProfile profile = patientService.updatePatientProfile(userDetails.getUser().getId(), patientDto);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<PatientProfile> getPatientProfile(@PathVariable Long userId) {
        PatientProfile profile = patientService.getPatientProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
