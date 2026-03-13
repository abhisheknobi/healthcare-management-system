package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponseDto {
    private Long id;
    private Long appointmentId;
    private String diagnosis;
    private String doctorNotes;
    private List<PrescribedMedicationResponseDto> medications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
