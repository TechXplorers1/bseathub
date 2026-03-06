package com.eathub.common.service;

import com.eathub.common.dto.ChefRequestDTO;
import com.eathub.common.dto.ChefResponseDTO;
import com.eathub.common.dto.ChefServiceRequestDTO;
import com.eathub.common.dto.ChefServiceResponseDTO;
import com.eathub.common.entity.Chef;
import com.eathub.common.entity.User;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.repository.ChefServiceRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChefManagementService {

    private final ChefRepository chefRepository;
    private final UserRepository userRepository;
    private final ChefServiceRepository chefServiceRepository;

    // ================= CHEF PROFILE =================

    public List<ChefResponseDTO> getAllChefs() {
        return chefRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ChefResponseDTO registerChef(ChefRequestDTO dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chef chef = Chef.builder()
                .name(dto.getName())
                .bio(dto.getBio())
                .experience(dto.getExperience())
                .avatarUrl(dto.getAvatarUrl())
                .rating(5.0)
                .reviewsCount(0)
                .owner(owner)
                .build();

        return mapToDTO(chefRepository.save(chef));
    }

    // ================= CHEF SERVICES =================

    public List<ChefServiceResponseDTO> getChefServices(String chefId) {
        return chefServiceRepository.findByChef_Id(chefId).stream()
                .map(this::mapToServiceDTO)
                .collect(Collectors.toList());
    }

    public ChefServiceResponseDTO addService(String chefId, ChefServiceRequestDTO dto) {
        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        com.eathub.common.entity.ChefService service = com.eathub.common.entity.ChefService.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .chef(chef)
                .build();

        return mapToServiceDTO(chefServiceRepository.save(service));
    }

    public ChefServiceResponseDTO updateService(String serviceId, ChefServiceRequestDTO dto) {
        com.eathub.common.entity.ChefService service = chefServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setBasePrice(dto.getBasePrice());
        service.setStatus(dto.getStatus());

        return mapToServiceDTO(chefServiceRepository.save(service));
    }

    public void deleteService(String serviceId) {
        chefServiceRepository.deleteById(serviceId);
    }

    // ================= MAPPERS =================

    private ChefServiceResponseDTO mapToServiceDTO(com.eathub.common.entity.ChefService service) {
        return ChefServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .basePrice(service.getBasePrice())
                .status(service.getStatus())
                .build();
    }

    private ChefResponseDTO mapToDTO(Chef chef) {
        ChefResponseDTO dto = new ChefResponseDTO();
        dto.setId(chef.getId());
        dto.setName(chef.getName());
        dto.setBio(chef.getBio());
        dto.setExperience(chef.getExperience());
        dto.setAvatarUrl(chef.getAvatarUrl());
        dto.setRating(chef.getRating());
        dto.setReviews(chef.getReviewsCount());

        // Fix: These should eventually come from the database
        dto.setSpecialty("General");
        dto.setPreference("Veg & Non-Veg");
        return dto;
    }
}