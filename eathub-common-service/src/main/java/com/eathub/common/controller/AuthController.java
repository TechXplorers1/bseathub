package com.eathub.common.controller;

import com.eathub.common.dto.AuthDTOs.*;
import com.eathub.common.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            System.err.println("Login Failed: " + e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/partner/register")
    public ResponseEntity<?> registerPartner(@RequestBody PartnerRegistrationRequest request) {
        // Spring will now be able to instantiate PartnerRegistrationRequest because it
        // is static
        return ResponseEntity.ok(authService.registerPartner(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        // The service should validate the token and return user details
        return ResponseEntity.ok(authService.getCurrentUser(token));
    }
}
