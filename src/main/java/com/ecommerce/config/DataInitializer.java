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
            
            // Check if admin user already exists (by username or email)
            if (userRepository.findByEmail(adminEmail).isEmpty() && userRepository.findByUsername(adminUsername).isEmpty()) {
                User adminUser = new User();
                adminUser.setEmail(adminEmail);
                adminUser.setUsername(adminUsername);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setFullName("Administrator");
                
                userRepository.save(adminUser);
                System.out.println("✅ Admin user created successfully!");
                System.out.println("   Email: " + adminEmail);
                System.out.println("   Username: " + adminUsername);
            } else {
                System.out.println("✅ Admin user already exists");
            }
        };
    }
}
