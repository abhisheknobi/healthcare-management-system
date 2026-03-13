package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponseDto {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private Double consultationFee;
    private Double medicationFee;
    private Double laboratoryFee;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
