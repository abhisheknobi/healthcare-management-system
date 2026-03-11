package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponseDto {
    private Long id;
    private Long userId;
    private String name;
    private String role;
    private String specialization;
    private String qualification;
    private String contactNumber;
}
