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

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
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
        seedAdminUser();
        seedDepartments();
        seedMedications();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(RoleType.ADMIN);
            userRepository.save(admin);
        }
    }

    private void seedDepartments() {
        List<String> defaultDepts = Arrays.asList("Cardiology", "Neurology", "Pediatrics", "Emergency", "Orthopedics");
        for (String deptName : defaultDepts) {
            if (!departmentRepository.existsByName(deptName)) {
                Department dept = Department.builder()
                        .name(deptName)
                        .description("Default hospital department for " + deptName)
                        .build();
                departmentRepository.save(dept);
            }
        }
    }

    private void seedMedications() {
        if (medicationRepository.count() == 0) {
            List<Medication> defaultMedications = Arrays.asList(
                Medication.builder().name("Paracetamol").manufacturer("GSK").price(5.0).stockQuantity(100).build(),
                Medication.builder().name("Ibuprofen").manufacturer("Pfizer").price(8.0).stockQuantity(50).build(),
                Medication.builder().name("Amoxicillin").manufacturer("Sandoz").price(15.0).stockQuantity(30).build(),
                Medication.builder().name("Cetirizine").manufacturer("Cipla").price(4.0).stockQuantity(80).build(),
                Medication.builder().name("Metformin").manufacturer("Merck").price(12.0).stockQuantity(60).build()
            );
            medicationRepository.saveAll(defaultMedications);
        }
    }
}
