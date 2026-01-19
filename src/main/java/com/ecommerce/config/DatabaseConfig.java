package com.ecommerce.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                // Parse Render's DATABASE_URL format: postgres://user:password@host:port/database
                URI dbUri = new URI(databaseUrl);
                
                String username = dbUri.getUserInfo().split(":")[0];
                String password = dbUri.getUserInfo().split(":")[1];
                String host = dbUri.getHost();
                int port = dbUri.getPort();
                
                // If port is not specified, use default PostgreSQL port
                if (port == -1) {
                    port = 5432;
                }
                
                String database = dbUri.getPath().substring(1); // Remove leading '/'
                
                // Build JDBC URL: jdbc:postgresql://host:port/database
                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
                
                return DataSourceBuilder
                        .create()
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (URISyntaxException e) {
                throw new RuntimeException("Error parsing DATABASE_URL", e);
            }
        }
        
        // Fallback for local development (shouldn't reach here in prod profile)
        throw new RuntimeException("DATABASE_URL environment variable not set");
    }
}
