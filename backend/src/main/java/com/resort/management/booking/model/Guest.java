package com.resort.management.booking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, length = 100)
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^(?:\\+91|0)?[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50)
    private String city;

    @NotBlank(message = "State code is required")
    @Column(name = "state_code", nullable = false, length = 5)
    private String stateCode; // Two-letter Indian state code, e.g. "MH", "GA"

    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", message = "Invalid GSTIN format")
    @Column(length = 15)
    private String gstin;

    @Column(name = "id_proof_type", length = 30)
    private String idProofType; // AADHAR, PASSPORT, etc.

    @Column(name = "id_proof_url", columnDefinition = "TEXT")
    private String idProofUrl; // Supabase PDF/Image Link

    @Builder.Default
    @Column(name = "total_stays")
    private Integer totalStays = 0;

    @Builder.Default
    @Column(name = "total_spend", precision = 12, scale = 2)
    private BigDecimal totalSpend = BigDecimal.ZERO;
}
