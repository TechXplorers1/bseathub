package com.eathub.common.controller;

import com.eathub.common.dto.ChefRequestDTO;
import com.eathub.common.dto.ChefResponseDTO;
import com.eathub.common.service.ChefManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/chefs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:9004")
public class ChefController {

    private final ChefManagementService service;

    @GetMapping
    public List<ChefResponseDTO> getAll() {
        return service.getAllChefs();
    }

    @PostMapping("/register")
    public ChefResponseDTO register(@RequestBody ChefRequestDTO request) {
        return service.registerChef(request);
    }
}