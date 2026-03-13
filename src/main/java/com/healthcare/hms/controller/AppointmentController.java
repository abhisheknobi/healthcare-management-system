package com.healthcare.hms.controller;

import com.healthcare.hms.dto.AppointmentRequestDto;
import com.healthcare.hms.dto.AppointmentResponseDto;
import com.healthcare.hms.dto.PrescriptionDto;
import com.healthcare.hms.dto.PrescriptionResponseDto;
import com.healthcare.hms.model.Appointment;
import com.healthcare.hms.model.AppointmentStatus;
import com.healthcare.hms.model.Prescription;
import com.healthcare.hms.security.CustomUserDetails;
import com.healthcare.hms.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDto> bookAppointment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AppointmentRequestDto request) {
        AppointmentResponseDto appointment = appointmentService.bookAppointment(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDto>> getPatientAppointments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(userDetails.getUser().getId()));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDto>> getDoctorAppointments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(userDetails.getUser().getId()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST')")
    public ResponseEntity<AppointmentResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @PostMapping("/{id}/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponseDto> addPrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionDto dto) {
        return ResponseEntity.ok(appointmentService.addPrescription(id, dto));
    }
}
