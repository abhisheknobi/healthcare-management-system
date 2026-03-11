package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {
    private String bloodGroup;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotBlank(message = "Address is required")
    private String address;
    private String medicalHistory;
    private String allergies;
}
