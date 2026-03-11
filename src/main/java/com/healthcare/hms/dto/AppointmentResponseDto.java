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
public class AppointmentResponseDto {
    private Long id;
    private Long doctorUserId;
    private String doctorName;
    private Long patientUserId;
    private String patientName;
    private LocalDateTime appointmentTime;
    private String status;
}
