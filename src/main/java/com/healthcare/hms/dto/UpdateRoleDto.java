package com.healthcare.hms.dto;

import com.healthcare.hms.model.RoleType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleDto {

    @NotNull(message = "Role is required")
    private RoleType role;
}
