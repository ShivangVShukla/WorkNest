package com.coworking.config;

import com.coworking.entity.Desk;
import com.coworking.entity.Member;
import com.coworking.entity.Space;
import com.coworking.entity.User;
import com.coworking.repository.DeskRepository;
import com.coworking.repository.MemberRepository;
import com.coworking.repository.SpaceRepository;
import com.coworking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SpaceRepository spaceRepository;
    private final DeskRepository deskRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure default users
        User demoUser = userRepository.findByEmail("alex@worknest.io").orElseGet(() -> {
            User user = new User();
            user.setName("Alex Rivera");
            user.setEmail("alex@worknest.io");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(User.Role.MEMBER);
            return userRepository.save(user);
        });

        if (memberRepository.findByUserId(demoUser.getId()).isEmpty()) {
            Member member = new Member(demoUser, "TechFlow Studio", "+91 9876543210", "PRO");
            memberRepository.save(member);
        }

        // Check if spaces exist
        if (spaceRepository.count() == 0) {
            Space space1 = new Space();
            space1.setName("Indiranagar Innovation Hub");
            space1.setLocation("100 Feet Rd, Indiranagar, Bengaluru");
            space1.setDescription("Premium collaborative desks and glass cabins with ultra-fast gigabit WiFi, ergonomic chairs, and artisan coffee bar.");
            space1.setSpaceType("DESK");
            space1.setPricePerDay(499.00);
            space1.setPricePerMonth(8999.00);
            space1.setActive(true);
            space1 = spaceRepository.save(space1);

            Space space2 = new Space();
            space2.setName("Cyber City Executive Suites");
            space2.setLocation("DLF Phase 2, Gurugram");
            space2.setDescription("Sound-proof private executive cabins and dedicated pod suites equipped for focused executives and high-growth teams.");
            space2.setSpaceType("CABIN");
            space2.setPricePerDay(999.00);
            space2.setPricePerMonth(18999.00);
            space2.setActive(true);
            space2 = spaceRepository.save(space2);

            Space space3 = new Space();
            space3.setName("BKC Sky Lounge & Workspace");
            space3.setLocation("Bandra Kurla Complex, Mumbai");
            space3.setDescription("Panoramic skyline views, private meeting pods, open collaborative hot desks and private team cabins.");
            space3.setSpaceType("CABIN");
            space3.setPricePerDay(1199.00);
            space3.setPricePerMonth(21999.00);
            space3.setActive(true);
            space3 = spaceRepository.save(space3);

            createDesksForSpace(space1);
            createDesksForSpace(space2);
            createDesksForSpace(space3);
            log.info("Initialized default spaces and desks.");
        } else {
            // Check if desks exist for existing spaces
            List<Space> existingSpaces = spaceRepository.findAll();
            for (Space space : existingSpaces) {
                if (deskRepository.findBySpaceId(space.getId()).isEmpty()) {
                    createDesksForSpace(space);
                }
            }
        }
    }

    private void createDesksForSpace(Space space) {
        // Create an intuitive 4x4 or 3x6 seat layout with desks and private cabins
        int rows = 3;
        int cols = 4;
        for (int r = 1; r <= rows; r++) {
            for (int c = 1; c <= cols; c++) {
                Desk desk = new Desk();
                desk.setSpace(space);
                desk.setRowNumber(r);
                desk.setColNumber(c);
                desk.setActive(true);

                // Row 3 are private cabins, Row 1 & 2 are open flex/dedicated desks
                if (r == 3) {
                    desk.setDeskCode("C-" + (r * 10 + c));
                    desk.setDeskType("CABIN");
                    desk.setCapacity(4);
                    desk.setDailyPriceMultiplier(BigDecimal.valueOf(1.5));
                } else {
                    desk.setDeskCode("D-" + (r * 10 + c));
                    desk.setDeskType("DESK");
                    desk.setCapacity(1);
                    desk.setDailyPriceMultiplier(BigDecimal.ONE);
                }
                deskRepository.save(desk);
            }
        }
    }
}
