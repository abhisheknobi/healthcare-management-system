package com.healthcare.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillDto {
    @NotNull(message = "Consultation fee is required")
    @PositiveOrZero(message = "Fee must be a positive amount or zero")
    private Double consultationFee;

    @PositiveOrZero(message = "Fee must be a positive amount or zero")
    private Double laboratoryFee;

    @PositiveOrZero(message = "Fee must be a positive amount or zero")
    private Double medicationFee;
}
