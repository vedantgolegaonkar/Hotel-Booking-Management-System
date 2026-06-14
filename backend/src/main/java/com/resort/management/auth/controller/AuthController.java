package com.resort.management.auth.controller;

import com.resort.management.auth.jwt.JwtUtils;
import com.resort.management.auth.service.UserDetailsImpl;
import com.resort.management.auth.models.RefreshToken;
import com.resort.management.auth.service.RefreshTokenService;
import com.resort.management.auth.exception.TokenRefreshException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import com.resort.management.auth.model.Role;
import com.resort.management.auth.model.User;
import com.resort.management.auth.repository.RoleRepository;
import com.resort.management.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        if (userRepository.existsByMobile(signUpRequest.getMobile())) {
            return ResponseEntity.badRequest().body("Error: Mobile number is already in use!");
        }

        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .mobile(signUpRequest.getMobile())
                .password(encoder.encode(signUpRequest.getPassword()))
                .isActive(true)
                .build();

        Set<Role> roles = new HashSet<>();
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(customerRole);
        user.setRoles(roles);

        userRepository.save(user);
        return ResponseEntity.ok("Customer registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(new JwtResponse(
                        userDetails.getId().toString(),
                        userDetails.getUsername(),
                        userDetails.getFirstName(),
                        userDetails.getLastName(),
                        userDetails.getMobile(),
                        roles
                ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Object principle = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principle.toString() != "anonymousUser") {
            UUID userId = ((UserDetailsImpl) principle).getId();
            refreshTokenService.deleteByUserId(userId);
        }

        ResponseCookie jwtCookie = jwtUtils.getCleanJwtCookie();
        ResponseCookie jwtRefreshCookie = jwtUtils.getCleanJwtRefreshCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body("You've been signed out!");
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
        String refreshToken = jwtUtils.getJwtRefreshFromCookies(request);

        if ((refreshToken != null) && (refreshToken.length() > 0)) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(
                                new UsernamePasswordAuthenticationToken(UserDetailsImpl.build(user), null, UserDetailsImpl.build(user).getAuthorities())
                        );

                        return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .body("Token is refreshed successfully!");
                    })
                    .orElseThrow(() -> new TokenRefreshException(refreshToken, "Refresh token is not in database!"));
        }

        return ResponseEntity.badRequest().body("Refresh Token is empty!");
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email cannot be blank")
        private String email;

        @NotBlank(message = "Password cannot be blank")
        private String password;
    }

    @Data
    public static class JwtResponse {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String mobile;
        private List<String> roles;

        public JwtResponse(String id, String email, String firstName, String lastName, String mobile, List<String> roles) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.mobile = mobile;
            this.roles = roles;
        }
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank
        private String email;
        @NotBlank
        private String mobile;
        @NotBlank
        private String password;
    }
}
