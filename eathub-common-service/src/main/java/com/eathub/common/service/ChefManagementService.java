package com.eathub.common.service;

import com.eathub.common.dto.ChefRequestDTO;
import com.eathub.common.dto.ChefResponseDTO;
import com.eathub.common.entity.Chef;
import com.eathub.common.entity.User;
import com.eathub.common.repository.ChefRepository;
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