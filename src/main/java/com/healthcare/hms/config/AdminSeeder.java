package com.healthcare.hms.config;

import com.healthcare.hms.model.RoleType;
import com.healthcare.hms.model.User;
import com.healthcare.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(RoleType.ADMIN);
            userRepository.save(admin);
        }
    }
}
