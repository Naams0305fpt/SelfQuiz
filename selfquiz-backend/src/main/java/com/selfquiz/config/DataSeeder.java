package com.selfquiz.config;

import com.selfquiz.model.Role;
import com.selfquiz.model.User;
import com.selfquiz.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User newUser = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "admin@selfquiz.com",
                    Role.ROLE_ADMIN
            );
            return userRepository.save(newUser);
        });

        // Assign legacy data (where created_by is null) to Admin
        Long adminId = admin.getId();
        
        jdbcTemplate.update("UPDATE subjects SET created_by = ? WHERE created_by IS NULL", adminId);
        jdbcTemplate.update("UPDATE decks SET created_by = ? WHERE created_by IS NULL", adminId);
        jdbcTemplate.update("UPDATE questions SET created_by = ? WHERE created_by IS NULL", adminId);
        jdbcTemplate.update("UPDATE answers SET created_by = ? WHERE created_by IS NULL", adminId);
    }
}
