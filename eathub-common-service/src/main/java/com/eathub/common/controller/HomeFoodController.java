package com.eathub.common.controller;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.service.HomeFoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/home-food")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:9004") // Adjusted to standard Next.js port
public class HomeFoodController {
    private final HomeFoodService service;

    @GetMapping
    public List<HomeFoodResponseDTO> getAll() {
        return service.getAllHomeFoods();
    }

    // This is the "Push" call for when a new provider joins
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public HomeFoodResponseDTO register(@RequestBody HomeFoodRequestDTO request) {
        return service.registerHomeFoodProvider(request);
    }

    @PostMapping("/{ownerId}/menu-items")
    public ResponseEntity<String> addMenuItem(
            @PathVariable String ownerId,
            @RequestBody MenuItemRequestDTO request) {

        service.addDish(ownerId, request);
        return ResponseEntity.ok("Dish added successfully");
    }
}
