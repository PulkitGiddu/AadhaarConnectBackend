package com.aadhaarconnect.config;

import com.aadhaarconnect.entity.MockUser;
import com.aadhaarconnect.entity.RpClient;
import com.aadhaarconnect.repository.MockUserRepository;
import com.aadhaarconnect.repository.RpClientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds the database with demo users and RP clients on startup if they don't
 * already exist.
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner seedData(MockUserRepository userRepo, RpClientRepository rpRepo) {
        return args -> {
            // Seed mock users with Aadhaar numbers
            if (userRepo.count() == 0) {
                log.info("Seeding mock users...");
                userRepo.saveAll(List.of(
                        MockUser.builder()
                                .fullName("Rahul Sharma")
                                .aadhaarNumber("234567890123")
                                .mobile("9876543210")
                                .dateOfBirth(LocalDate.of(1995, 6, 15))
                                .gender("Male")
                                .state("Maharashtra")
                                .aadhaarHash("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4")
                                .build(),
                        MockUser.builder()
                                .fullName("Priya Verma")
                                .aadhaarNumber("345678901234")
                                .mobile("9876543211")
                                .dateOfBirth(LocalDate.of(1998, 3, 22))
                                .gender("Female")
                                .state("Karnataka")
                                .aadhaarHash("b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5")
                                .build(),
                        MockUser.builder()
                                .fullName("Arjun Minor")
                                .aadhaarNumber("456789012345")
                                .mobile("9876543212")
                                .dateOfBirth(LocalDate.of(2012, 11, 8))
                                .gender("Male")
                                .state("Delhi")
                                .aadhaarHash("c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6")
                                .build(),
                        MockUser.builder()
                                .fullName("Rishita Patel")
                                .aadhaarNumber("567890123456")
                                .mobile("9876543213")
                                .dateOfBirth(LocalDate.of(1997, 1, 10))
                                .gender("Female")
                                .state("Gujarat")
                                .aadhaarHash("d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1")
                                .build(),
                        MockUser.builder()
                                .fullName("Rahul Gupta")
                                .aadhaarNumber("678901234567")
                                .mobile("9876543214")
                                .dateOfBirth(LocalDate.of(1993, 9, 25))
                                .gender("Male")
                                .state("Uttar Pradesh")
                                .aadhaarHash("e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2")
                                .build(),
                        MockUser.builder()
                                .fullName("Karan Singh")
                                .aadhaarNumber("789012345678")
                                .mobile("9876543215")
                                .dateOfBirth(LocalDate.of(2000, 4, 18))
                                .gender("Male")
                                .state("Rajasthan")
                                .aadhaarHash("f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3")
                                .build(),
                        MockUser.builder()
                                .fullName("Pulkit Giddu")
                                .aadhaarNumber("890123456789")
                                .mobile("9876543216")
                                .dateOfBirth(LocalDate.of(1999, 7, 3))
                                .gender("Male")
                                .state("Telangana")
                                .aadhaarHash("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d5")
                                .build()));
                log.info(" 7 mock users seeded.");
            }

            // Seed RP clients (5 demo platforms)
            seedRpClient(rpRepo, "groww", "groww-secret-hash", "Groww",
                    List.of("http://localhost:5173/callback"), List.of("openid", "profile", "age_over_18"));

            seedRpClient(rpRepo, "phonepe", "phonepe-secret-hash", "PhonePe",
                    List.of("http://localhost:5173/callback"), List.of("openid", "profile", "age_over_18"));

            seedRpClient(rpRepo, "hdfc-bank", "hdfc-secret-hash", "HDFC Bank",
                    List.of("http://localhost:5173/callback"), List.of("openid", "profile", "age_over_18"));

            seedRpClient(rpRepo, "paytm", "paytm-secret-hash", "Paytm",
                    List.of("http://localhost:5173/callback"), List.of("openid", "profile", "age_over_18"));

            seedRpClient(rpRepo, "amazon-in", "amazon-secret-hash", "Amazon India",
                    List.of("http://localhost:5173/callback"), List.of("openid", "profile", "age_over_18"));
        };
    }

    private void seedRpClient(RpClientRepository rpRepo, String clientId, String secret, String name,
            List<String> redirectUris, List<String> scopes) {
        if (!rpRepo.existsById(clientId)) {
            rpRepo.save(RpClient.builder()
                    .clientId(clientId)
                    .clientSecret(secret)
                    .clientName(name)
                    .redirectUris(redirectUris)
                    .allowedScopes(scopes)
                    .build());
            log.info("RP client seeded: {}", name);
        }
    }
}
