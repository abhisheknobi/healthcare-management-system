package com.healthcare.hms.controller;

import com.healthcare.hms.dto.DepartmentDto;
import com.healthcare.hms.dto.MedicationDto;
import com.healthcare.hms.dto.RegisterDto;
import com.healthcare.hms.dto.UpdateRoleDto;
import com.healthcare.hms.model.Department;
import com.healthcare.hms.model.Medication;
import com.healthcare.hms.model.RoleType;
import com.healthcare.hms.model.User;
import com.healthcare.hms.repository.DepartmentRepository;
import com.healthcare.hms.repository.MedicationRepository;
import com.healthcare.hms.repository.UserRepository;
import com.healthcare.hms.repository.PrescriptionRepository;
import com.healthcare.hms.service.BillService;
import com.healthcare.hms.model.Prescription;
import com.healthcare.hms.model.PrescribedMedication;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MedicationRepository medicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrescriptionRepository prescriptionRepository;
    private final BillService billService;

    // --- User Management ---

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setFirstName(registerDto.getFirstName());
        user.setLastName(registerDto.getLastName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        
        // Admins can register any role. Default to DOCTOR if not provided.
        RoleType roleType = registerDto.getRole() != null ? registerDto.getRole() : RoleType.DOCTOR;
        user.setRole(roleType);

        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleDto updateRoleDto) {
        Optional<User> optionalUser = userRepository.findById(id);
        
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        
        User user = optionalUser.get();
        user.setRole(updateRoleDto.getRole());
        userRepository.save(user);
        
        return ResponseEntity.ok("User role updated successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // --- Department Management ---

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentDto departmentDto) {
        if (departmentRepository.existsByName(departmentDto.getName())) {
            return new ResponseEntity<>("Department already exists", HttpStatus.BAD_REQUEST);
        }
        
        Department department = Department.builder()
                .name(departmentDto.getName())
                .description(departmentDto.getDescription())
                .build();
                
        departmentRepository.save(department);
        
        return new ResponseEntity<>(department, HttpStatus.CREATED);
    }

    // --- Medication Management ---

    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @GetMapping("/medications")
    public ResponseEntity<List<Medication>> getAllMedications() {
        return ResponseEntity.ok(medicationRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/medications")
    public ResponseEntity<?> addMedication(@Valid @RequestBody MedicationDto dto) {
        log.info("Request to add medication: {}", dto.getName());
        try {
            Medication medication = Medication.builder()
                    .name(dto.getName())
                    .manufacturer(dto.getManufacturer())
                    .price(dto.getPrice())
                    .stockQuantity(dto.getStockQuantity())
                    .build();
            medicationRepository.save(medication);
            log.info("Medication added successfully: {}", medication.getId());
            return new ResponseEntity<>(medication, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Failed to add medication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/medications/{id}")
    public ResponseEntity<?> updateMedication(@PathVariable Long id, @Valid @RequestBody MedicationDto dto) {
        return medicationRepository.findById(id).map(medication -> {
            medication.setName(dto.getName());
            medication.setManufacturer(dto.getManufacturer());
            medication.setPrice(dto.getPrice());
            medication.setStockQuantity(dto.getStockQuantity());
            medicationRepository.save(medication);
            return ResponseEntity.ok("Medication updated successfully");
        }).orElse(new ResponseEntity<>("Medication not found", HttpStatus.NOT_FOUND));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/medications/{id}")
    public ResponseEntity<?> deleteMedication(@PathVariable Long id) {
        if (!medicationRepository.existsById(id)) {
            return new ResponseEntity<>("Medication not found", HttpStatus.NOT_FOUND);
        }
        medicationRepository.deleteById(id);
        return ResponseEntity.ok("Medication deleted successfully");
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @GetMapping("/appointments/{appointmentId}/bill-estimate")
    public ResponseEntity<Double> getMedicationFeeEstimate(@PathVariable Long appointmentId) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId).orElse(null);
        double fee = 0.0;
        if (prescription != null) {
            for (PrescribedMedication pm : prescription.getMedications()) {
                fee += pm.getMedication().getPrice() * pm.getQuantity();
            }
        }
        return ResponseEntity.ok(Double.valueOf(fee));
    }
}
