package com.healthcare.hms.controller;

import com.healthcare.hms.dto.BillDto;
import com.healthcare.hms.dto.BillResponseDto;
import com.healthcare.hms.model.Bill;
import com.healthcare.hms.security.CustomUserDetails;
import com.healthcare.hms.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<BillResponseDto> generateBill(@PathVariable Long appointmentId, @Valid @RequestBody BillDto billDto) {
        return ResponseEntity.ok(billService.generateBill(appointmentId, billDto));
    }

    @PutMapping("/{billId}/pay")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('PATIENT')")
    public ResponseEntity<BillResponseDto> payBill(@PathVariable Long billId) {
        return ResponseEntity.ok(billService.payBill(billId));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<BillResponseDto>> getMyBills(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(billService.getPatientBills(userDetails.getUser().getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<List<BillResponseDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }
}
