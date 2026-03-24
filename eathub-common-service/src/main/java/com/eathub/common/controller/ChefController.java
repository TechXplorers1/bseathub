package com.eathub.common.controller;

import com.eathub.common.dto.*;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.service.ChefManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/chefs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Adjusted to standard Next.js port
public class ChefController {

    private final ChefManagementService service;
    private final ChefRepository chefRepository;

    @GetMapping
    public List<ChefResponseDTO> getAll() {
        return service.getAllChefs();
    }

    @PostMapping("/register")
    public ChefResponseDTO register(@RequestBody ChefRequestDTO request) {
        return service.registerChef(request);
    }

    @GetMapping("/slug/{slug}")
    public ChefResponseDTO getBySlug(@PathVariable String slug) {
        return service.getChefBySlug(slug);
    }

    @GetMapping("/{id}")
    public ChefResponseDTO getById(@PathVariable String id) {
        return service.getChefById(id);
    }

    // ================= CHEF PROFILE UPDATES =================

    @PutMapping("/{id}/profile")
    public ChefResponseDTO updateProfile(@PathVariable String id, @RequestBody ChefProfileUpdateDTO dto) {
        return service.updateProfile(id, dto);
    }

    @PutMapping("/{id}/address")
    public ChefResponseDTO updateAddress(@PathVariable String id, @RequestBody ChefProfileUpdateDTO dto) {
        return service.updateAddress(id, dto);
    }

    @PutMapping("/{id}/legal")
    public ChefResponseDTO updateLegal(@PathVariable String id, @RequestBody ChefProfileUpdateDTO dto) {
        return service.updateLegal(id, dto);
    }

    // ================= CHEF SERVICES =================

    @GetMapping("/{chefId}/services")
    public List<ChefServiceResponseDTO> getServices(@PathVariable String chefId) {
        return service.getChefServices(chefId);
    }

    @GetMapping("/{chefId}/services/grouped")
    public List<com.eathub.common.dto.MenuCategoryDTO> getGroupedServices(@PathVariable String chefId) {
        return service.getGroupedChefServices(chefId);
    }

    @PostMapping("/{chefId}/services")
    public ChefServiceResponseDTO addService(@PathVariable String chefId, @RequestBody ChefServiceRequestDTO request) {
        return service.addService(chefId, request);
    }

    @PutMapping("/services/{serviceId}")
    public ChefServiceResponseDTO updateService(@PathVariable String serviceId,
            @RequestBody ChefServiceRequestDTO request) {
        return service.updateService(serviceId, request);
    }

    @DeleteMapping("/services/{serviceId}")
    public void deleteService(@PathVariable String serviceId) {
        service.deleteService(serviceId);
    }
}
