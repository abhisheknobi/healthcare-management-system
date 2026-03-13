package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescribedMedicationResponseDto {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private Integer quantity;
    private Double priceAtPrescription;
}
