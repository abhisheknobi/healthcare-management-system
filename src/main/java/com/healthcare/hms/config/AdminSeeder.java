package com.healthcare.hms.config;

import com.healthcare.hms.model.Department;
import com.healthcare.hms.model.Medication;
import com.healthcare.hms.model.RoleType;
import com.healthcare.hms.model.User;
import com.healthcare.hms.repository.DepartmentRepository;
import com.healthcare.hms.repository.MedicationRepository;
import com.healthcare.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.List;

@Component  
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final MedicationRepository medicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.email}")
    private String adminEmail;

    @Value("${admin.default.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting AdminSeeder...");
        seedAdminUser();
        seedDepartments();
        seedMedications();
        log.info("AdminSeeder finished.");
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(RoleType.ADMIN);
            admin.setCreatedAt(now);
            admin.setUpdatedAt(now);
            userRepository.save(admin);
            log.info("Seeded default admin user: {}", adminEmail);
        }
    }

    private void seedDepartments() {
        List<String> defaultDepts = Arrays.asList("Cardiology", "Neurology", "Pediatrics", "Emergency", "Orthopedics");
        for (String deptName : defaultDepts) {
            if (!departmentRepository.existsByName(deptName)) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                Department dept = Department.builder()
                        .name(deptName)
                        .description("Default hospital department for " + deptName)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
                departmentRepository.save(dept);
                log.info("Seeded department: {}", deptName);
            }
        }
    }

    private void seedMedications() {
        if (medicationRepository.count() == 0) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            List<Medication> defaultMedications = Arrays.asList(
                Medication.builder().name("Paracetamol").manufacturer("GSK").price(5.0).stockQuantity(100).createdAt(now).updatedAt(now).build(),
                Medication.builder().name("Ibuprofen").manufacturer("Pfizer").price(8.0).stockQuantity(50).createdAt(now).updatedAt(now).build(),
                Medication.builder().name("Amoxicillin").manufacturer("Sandoz").price(15.0).stockQuantity(30).createdAt(now).updatedAt(now).build(),
                Medication.builder().name("Cetirizine").manufacturer("Cipla").price(4.0).stockQuantity(80).createdAt(now).updatedAt(now).build(),
                Medication.builder().name("Metformin").manufacturer("Merck").price(12.0).stockQuantity(60).createdAt(now).updatedAt(now).build(),
                Medication.builder().name("Aspirin").manufacturer("Bayer").price(3.5).stockQuantity(200).createdAt(now).updatedAt(now).build()
            );
            medicationRepository.saveAll(defaultMedications);
            log.info("Seeded {} default medications", defaultMedications.size());
        }
    }
}
