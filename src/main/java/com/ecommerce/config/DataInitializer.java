package com.ecommerce.config;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Get admin credentials from environment variables
            String adminEmail = System.getenv("ADMIN_EMAIL");
            String adminPassword = System.getenv("ADMIN_PASSWORD");
            String adminUsername = System.getenv("ADMIN_USERNAME");
            
            // Use defaults if not provided
            if (adminEmail == null || adminEmail.isEmpty()) {
                adminEmail = "admin@ecommerce.com";
            }
            if (adminPassword == null || adminPassword.isEmpty()) {
                adminPassword = "admin123456";
            }
            if (adminUsername == null || adminUsername.isEmpty()) {
                adminUsername = "admin";
            }
            
            // Ensure admin user exists and matches configured credentials
            userRepository.findByUsername(adminUsername).ifPresentOrElse(existing -> {
                existing.setEmail(adminEmail);
                existing.setPassword(passwordEncoder.encode(adminPassword));
                existing.setRole(User.Role.ADMIN);
                existing.setActive(true);
                if (existing.getFullName() == null || existing.getFullName().isEmpty()) {
                    existing.setFullName("Administrator");
                }
                userRepository.save(existing);
                System.out.println("✅ Admin user updated to match configured credentials");
            }, () -> {
                User adminUser = new User();
                adminUser.setEmail(adminEmail);
                adminUser.setUsername(adminUsername);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setFullName("Administrator");
                adminUser.setActive(true);

                userRepository.save(adminUser);
                System.out.println("✅ Admin user created successfully!");
                System.out.println("   Email: " + adminEmail);
                System.out.println("   Username: " + adminUsername);
            });
        };
    }
}
