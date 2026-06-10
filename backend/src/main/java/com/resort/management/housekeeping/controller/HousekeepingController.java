package com.resort.management.housekeeping.controller;

import com.resort.management.auth.model.User;
import com.resort.management.auth.repository.UserRepository;
import com.resort.management.auth.service.UserDetailsImpl;
import com.resort.management.housekeeping.model.HousekeepingTask;
import com.resort.management.housekeeping.service.HousekeepingService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/housekeeping")
@CrossOrigin(origins = "*")
public class HousekeepingController {

    @Autowired
    private HousekeepingService housekeepingService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<HousekeepingTask>> getActiveTasks() {
        return ResponseEntity.ok(housekeepingService.getActiveTasks());
    }

    @PostMapping("/tasks/{id}/claim")
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> claimTask(@PathVariable Long id) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User staff = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Authenticated user record not found."));

            HousekeepingTask task = housekeepingService.startCleaning(id, staff);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/tasks/{id}/complete")
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> completeTask(@PathVariable Long id, @RequestBody TaskCompleteRequest request) {
        try {
            HousekeepingTask task = housekeepingService.completeCleaning(id, request.getNotes());
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @Data
    public static class TaskCompleteRequest {
        private String notes;
    }
}
