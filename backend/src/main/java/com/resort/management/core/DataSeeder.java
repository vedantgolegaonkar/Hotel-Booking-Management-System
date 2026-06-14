package com.resort.management.core;

import com.resort.management.auth.model.Role;
import com.resort.management.auth.model.User;
import com.resort.management.auth.repository.RoleRepository;
import com.resort.management.auth.repository.UserRepository;
import com.resort.management.booking.model.Coupon;
import com.resort.management.booking.repository.CouponRepository;
import com.resort.management.inventory.model.Room;
import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.model.RoomCategoryInventory;
import com.resort.management.inventory.repository.RoomCategoryInventoryRepository;
import com.resort.management.inventory.repository.RoomCategoryRepository;
import com.resort.management.inventory.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomCategoryRepository roomCategoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomCategoryInventoryRepository inventoryRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name("ROLE_GUEST").description("Guest customer").build());
            roleRepository.save(Role.builder().name("ROLE_RECEPTIONIST").description("Front-desk receptionist").build());
            roleRepository.save(Role.builder().name("ROLE_MANAGER").description("Resort Manager").build());
            roleRepository.save(Role.builder().name("ROLE_HOUSEKEEPING").description("Housekeeping clean team").build());
            roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").description("System administrator").build());
        }
        
        if (roleRepository.findByName("ROLE_CUSTOMER").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_CUSTOMER").description("Restaurant and Hotel Customer").build());
        }

        // Fetch roles for user seeding
        // Fetch roles for user seeding
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").orElseThrow();
        Role receptionistRole = roleRepository.findByName("ROLE_RECEPTIONIST").orElseThrow();
        Role housekeepingRole = roleRepository.findByName("ROLE_HOUSEKEEPING").orElseThrow();
        Role managerRole = roleRepository.findByName("ROLE_MANAGER").orElseThrow();
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER").orElseThrow();

        // 2. Seed Users individually to ensure they exist across environments
        if (userRepository.findByEmail("manager@resort.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("manager@resort.com")
                    .password(encoder.encode("password"))
                    .firstName("Super")
                    .lastName("Manager")
                    .mobile("9999999999")
                    .roles(Set.of(managerRole, superAdminRole))
                    .build());
        }

        if (userRepository.findByEmail("receptionist@resort.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("receptionist@resort.com")
                    .password(encoder.encode("password"))
                    .firstName("Priya")
                    .lastName("Sharma")
                    .mobile("8888888888")
                    .roles(Set.of(receptionistRole))
                    .build());
        }

        if (userRepository.findByEmail("cleaner@resort.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("cleaner@resort.com")
                    .password(encoder.encode("password"))
                    .firstName("Rajesh")
                    .lastName("Kumar")
                    .mobile("7777777777")
                    .roles(Set.of(housekeepingRole))
                    .build());
        }
        
        // Always ensure vedant@gmail.com exists as a test guest account
        if (userRepository.findByEmail("vedant@gmail.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("vedant@gmail.com")
                    .password(encoder.encode("password"))
                    .firstName("Vedant")
                    .lastName("Guest")
                    .mobile("1111111111")
                    .roles(Set.of(customerRole))
                    .build());
        }

        // 2b. Auto-Migrate any legacy accounts with NULL or plain text passwords
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (u.getPassword() == null || !u.getPassword().startsWith("$2a$")) {
                u.setPassword(encoder.encode("password"));
                userRepository.save(u);
            }
        }

        // 3. Seed Room Categories
        if (roomCategoryRepository.count() == 0) {
            RoomCategory deluxe = RoomCategory.builder()
                    .name("Deluxe Room")
                    .description("Cozy rooms with modern amenities, perfect for couples.")
                    .capacity(2)
                    .basePrice(new BigDecimal("6500.00"))
                    .amenities(Arrays.asList("AC", "WiFi", "TV", "Coffee Maker"))
                    .images(List.of("https://images.unsplash.com/photo-1590490360182-c33d57733427"))
                    .build();

            RoomCategory premium = RoomCategory.builder()
                    .name("Premium Room")
                    .description("Spacious family rooms with scenic balcony views.")
                    .capacity(3)
                    .basePrice(new BigDecimal("9500.00"))
                    .amenities(Arrays.asList("AC", "WiFi", "TV", "Mini Fridge", "Balcony"))
                    .images(List.of("https://images.unsplash.com/photo-1582719508461-905c673771fd"))
                    .build();

            RoomCategory suite = RoomCategory.builder()
                    .name("Suite Room")
                    .description("Luxury suites featuring private pools and premium bar setups.")
                    .capacity(4)
                    .basePrice(new BigDecimal("14500.00"))
                    .amenities(Arrays.asList("AC", "WiFi", "TV", "Mini Bar", "Private Pool", "Living Room"))
                    .images(List.of("https://images.unsplash.com/photo-1566665797739-1674de7a421a"))
                    .build();

            roomCategoryRepository.save(deluxe);
            roomCategoryRepository.save(premium);
            roomCategoryRepository.save(suite);
        }

        // 4. Seed Physical Rooms
        if (roomRepository.count() == 0) {
            RoomCategory deluxe = roomCategoryRepository.findByName("Deluxe Room").orElseThrow();
            RoomCategory premium = roomCategoryRepository.findByName("Premium Room").orElseThrow();
            RoomCategory suite = roomCategoryRepository.findByName("Suite Room").orElseThrow();

            // Deluxe rooms (4)
            roomRepository.save(Room.builder().roomNumber("101").category(deluxe).floor(1).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("102").category(deluxe).floor(1).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("103").category(deluxe).floor(1).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("104").category(deluxe).floor(1).status("AVAILABLE").build());

            // Premium rooms (3)
            roomRepository.save(Room.builder().roomNumber("201").category(premium).floor(2).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("202").category(premium).floor(2).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("203").category(premium).floor(2).status("AVAILABLE").build());

            // Suite rooms (2)
            roomRepository.save(Room.builder().roomNumber("301").category(suite).floor(3).status("AVAILABLE").build());
            roomRepository.save(Room.builder().roomNumber("302").category(suite).floor(3).status("AVAILABLE").build());

            // Initialize inventory entries for the next 365 days
            initializeDailyInventory();
        }

        // 5. Seed Coupons
        if (couponRepository.count() == 0) {
            couponRepository.save(Coupon.builder()
                    .code("ANNIVERSARY10")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("10.00"))
                    .minBookingValue(new BigDecimal("5000.00"))
                    .maxDiscountValue(new BigDecimal("2000.00"))
                    .startDate(LocalDate.now())
                    .expiryDate(LocalDate.now().plusYears(1))
                    .usageLimit(100)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("WELCOME1000")
                    .discountType("FIXED")
                    .discountValue(new BigDecimal("1000.00"))
                    .minBookingValue(new BigDecimal("8000.00"))
                    .startDate(LocalDate.now())
                    .expiryDate(LocalDate.now().plusYears(1))
                    .usageLimit(200)
                    .build());
        }

        // Fix Deluxe Room image URL if it was seeded with the deleted Unsplash photo
        roomCategoryRepository.findByName("Deluxe Room").ifPresent(deluxe -> {
            if (deluxe.getImages() != null && deluxe.getImages().contains("https://images.unsplash.com/photo-1611891405122-4a5524177d6c")) {
                List<String> newImages = new ArrayList<>(deluxe.getImages());
                newImages.remove("https://images.unsplash.com/photo-1611891405122-4a5524177d6c");
                newImages.add("https://images.unsplash.com/photo-1590490360182-c33d57733427");
                deluxe.setImages(newImages);
                roomCategoryRepository.save(deluxe);
            }
        });
    }

    private void initializeDailyInventory() {
        List<RoomCategory> categories = roomCategoryRepository.findAll();
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(365);

        for (RoomCategory cat : categories) {
            long totalRooms = roomRepository.countByCategory(cat);
            List<RoomCategoryInventory> list = new ArrayList<>();
            for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
                list.add(RoomCategoryInventory.builder()
                        .category(cat)
                        .inventoryDate(date)
                        .totalInventory((int) totalRooms)
                        .bookedCount(0)
                        .blockedCount(0)
                        .build());
            }
            inventoryRepository.saveAll(list);
        }
    }
}
