package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDto {
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String doctorNotes;

    private List<MedicationItemDto> medications;
}
