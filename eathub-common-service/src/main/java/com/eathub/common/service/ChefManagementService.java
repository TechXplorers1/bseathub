package com.eathub.common.service;

import com.eathub.common.dto.*;
import com.eathub.common.entity.Chef;
import com.eathub.common.entity.ChefAddress;
import com.eathub.common.entity.ChefLegalProfile;
import com.eathub.common.entity.User;
import com.eathub.common.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChefManagementService {

    private final ChefRepository chefRepository;
    private final UserRepository userRepository;
    private final ChefServiceRepository chefServiceRepository;
    private final ChefAddressRepository chefAddressRepository;
    private final ChefLegalProfileRepository chefLegalProfileRepository;

    // ================= CHEF PROFILE =================
    public List<ChefResponseDTO> getAllChefs() {
        return chefRepository.findAllWithDetails().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ChefResponseDTO getChefBySlug(String slug) {
        return chefRepository.findBySlug(slug)
                .map(this::mapToDTO)
                .or(() -> chefRepository.findById(slug).map(this::mapToDTO))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Chef not found with slug or ID: " + slug));
    }

    public ChefResponseDTO getChefById(String id) {
        return chefRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found with id: " + id));
    }

    public ChefResponseDTO getChefByOwnerId(String ownerId) {
        return chefRepository.findByOwnerId(ownerId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found for owner: " + ownerId));
    }

    public ChefResponseDTO registerChef(ChefRequestDTO dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Chef chef = Chef.builder()
                .name(dto.getName())
                .bio(dto.getBio())
                .experience(dto.getExperience())
                .avatarUrl(dto.getAvatarUrl())
                .slug(dto.getSlug())
                .rating(5.0)
                .reviewsCount(0)
                .isActive(true)
                .owner(owner)
                .build();

        return mapToDTO(chefRepository.save(chef));
    }

    @Transactional
    public ChefResponseDTO updateProfile(String id, ChefProfileUpdateDTO dto) {
        Chef chef = chefRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found"));

        if (dto.getName() != null) {
            chef.setName(dto.getName());
            if (chef.getOwner() != null) {
                chef.getOwner().setName(dto.getName());
                userRepository.save(chef.getOwner());
            }
        }
        if (dto.getBio() != null) {
            chef.setBio(dto.getBio());
        }
        if (dto.getExperience() != null) {
            chef.setExperience(dto.getExperience());
        }
        if (dto.getSpecialty() != null) {
            chef.setSpecialty(dto.getSpecialty());
        }
        if (dto.getAvatarUrl() != null) {
            chef.setAvatarUrl(dto.getAvatarUrl());
            if (chef.getOwner() != null) {
                chef.getOwner().setAvatarUrl(dto.getAvatarUrl());
                userRepository.save(chef.getOwner());
            }
        }
        if (dto.getWorkingHours() != null) {
            chef.setWorkingHours(dto.getWorkingHours());
        }
        if (dto.getCoverImageId() != null) {
            chef.setCoverImageId(dto.getCoverImageId());
        }
        if (dto.getIsActive() != null) {
            chef.setIsActive(dto.getIsActive());
        }

        // Expansion
        if (dto.getFullName() != null) {
            chef.setFullName(dto.getFullName());
        }
        if (dto.getContactNumber() != null) {
            chef.setContactNumber(dto.getContactNumber());
        }
        if (dto.getCountryCode() != null) {
            chef.setCountryCode(dto.getCountryCode());
        }
        if (dto.getCuisines() != null) {
            chef.setCuisines(dto.getCuisines());
        }
        if (dto.getDeliveryAvailability() != null) {
            chef.setDeliveryAvailability(dto.getDeliveryAvailability());
        }
        if (dto.getBasePrice() != null) {
            chef.setBasePrice(dto.getBasePrice());
        }
        if (dto.getWorkType() != null) {
            chef.setWorkType(dto.getWorkType());
        }
        if (dto.getSocialLinks() != null) {
            chef.setSocialLinks(dto.getSocialLinks());
        }

        // Update city if provided
        if (dto.getCity() != null) {
            ChefAddress address = chefAddressRepository.findByChef_Id(id)
                    .orElseGet(() -> ChefAddress.builder().chef(chef).build());
            address.setCity(dto.getCity());
            chefAddressRepository.save(address);
        }

        // Update bankName if provided
        if (dto.getBankName() != null) {
            ChefLegalProfile legal = chefLegalProfileRepository.findByChef_Id(id)
                    .orElseGet(() -> ChefLegalProfile.builder().chef(chef).build());
            legal.setBankName(dto.getBankName());
            chefLegalProfileRepository.save(legal);
        }

        return mapToDTO(chefRepository.save(chef));
    }

    @Transactional
    public ChefResponseDTO updateAddress(String id, ChefProfileUpdateDTO dto) {
        Chef chef = chefRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found"));

        ChefAddress address = chefAddressRepository.findByChef_Id(id)
                .orElseGet(() -> ChefAddress.builder().chef(chef).build());

        if (dto.getAddressLine1() != null) {
            address.setAddressLine1(dto.getAddressLine1());
        }
        if (dto.getAddressLine2() != null) {
            address.setAddressLine2(dto.getAddressLine2());
        }

        // Map houseNumber/streetName for UI compatibility if provided
        if (dto.getHouseNumber() != null) {
            address.setAddressLine1(dto.getHouseNumber());
        }
        if (dto.getStreetName() != null) {
            address.setAddressLine2(dto.getStreetName());
        }

        if (dto.getCity() != null) {
            address.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            address.setState(dto.getState());
        }
        if (dto.getPostalCode() != null) {
            address.setPostalCode(dto.getPostalCode());
        }
        if (dto.getCountry() != null) {
            address.setCountry(dto.getCountry());
        }

        chefAddressRepository.save(address);
        return mapToDTO(chef);
    }

    @Transactional
    public ChefResponseDTO updateLegal(String id, ChefProfileUpdateDTO dto) {
        Chef chef = chefRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found"));

        ChefLegalProfile legal = chefLegalProfileRepository.findByChef_Id(id)
                .orElseGet(() -> ChefLegalProfile.builder().chef(chef).build());

        if (dto.getLegalBusinessName() != null) {
            legal.setLegalBusinessName(dto.getLegalBusinessName());
        }
        if (dto.getGstNumber() != null) {
            legal.setGstNumber(dto.getGstNumber());
        }
        if (dto.getPanNumber() != null) {
            legal.setPanNumber(dto.getPanNumber());
        }
        if (dto.getBankAccountHolderName() != null) {
            legal.setBankAccountHolderName(dto.getBankAccountHolderName());
        }
        if (dto.getBankAccountNumber() != null) {
            legal.setBankAccountNumber(dto.getBankAccountNumber());
        }
        if (dto.getBankIFSC() != null) {
            legal.setBankIFSC(dto.getBankIFSC());
        }
        if (dto.getBankName() != null) {
            legal.setBankName(dto.getBankName());
        }
        if (dto.getFoodSafetyCertUrl() != null) {
            legal.setFoodSafetyCertUrl(dto.getFoodSafetyCertUrl());
        }
        if (dto.getCulinaryDiplomaUrl() != null) {
            legal.setCulinaryDiplomaUrl(dto.getCulinaryDiplomaUrl());
        }

        // Expansion
        if (dto.getIdProofType() != null) {
            legal.setIdProofType(dto.getIdProofType());
        }
        if (dto.getIdProofNumber() != null) {
            legal.setIdProofNumber(dto.getIdProofNumber());
        }
        if (dto.getIdProofUrl() != null) {
            legal.setIdProofUrl(dto.getIdProofUrl());
        }

        chefLegalProfileRepository.save(legal);
        return mapToDTO(chef);
    }

    // ================= CHEF SERVICES =================
    public List<ChefServiceResponseDTO> getChefServices(String chefId) {
        return chefServiceRepository.findByChef_Id(chefId).stream()
                .map(this::mapToServiceDTO)
                .collect(Collectors.toList());
    }

    public List<com.eathub.common.dto.MenuCategoryDTO> getGroupedChefServices(String chefId) {
        List<com.eathub.common.entity.ChefService> services = chefServiceRepository.findByChef_Id(chefId);

        return services.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getCategory() != null ? s.getCategory() : "General",
                        Collectors.mapping(s -> {
                            return com.eathub.common.dto.MenuItemDTO.builder()
                                    .id(s.getId())
                                    .name(s.getName())
                                    .description(s.getDescription())
                                    .price(s.getBasePrice() != null ? s.getBasePrice() : 0.0)
                                    .category(s.getCategory())
                                    .status(s.getStatus())
                                    .imageId(s.getImageId())
                                    .build();
                        }, Collectors.toList())))
                .entrySet().stream()
                .map(entry -> com.eathub.common.dto.MenuCategoryDTO.builder()
                .title(entry.getKey())
                .items(entry.getValue())
                .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChefServiceResponseDTO addService(String chefId, ChefServiceRequestDTO dto) {
        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chef not found"));

        com.eathub.common.entity.ChefService service = com.eathub.common.entity.ChefService.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .category(dto.getCategory())
                .itemType(dto.getItemType())
                .isSignature(dto.getIsSignature() != null ? dto.getIsSignature() : false)
                .isNegotiable(dto.getIsNegotiable() != null ? dto.getIsNegotiable() : false)
                .imageId(dto.getImageId())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .chef(chef)
                .build();

        return mapToServiceDTO(chefServiceRepository.save(service));
    }

    @Transactional
    public ChefServiceResponseDTO updateService(String serviceId, ChefServiceRequestDTO dto) {
        com.eathub.common.entity.ChefService service = chefServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setBasePrice(dto.getBasePrice());
        service.setCategory(dto.getCategory());
        service.setItemType(dto.getItemType());
        if (dto.getIsSignature() != null) {
            service.setIsSignature(dto.getIsSignature());
        }
        if (dto.getIsNegotiable() != null) {
            service.setIsNegotiable(dto.getIsNegotiable());
        }
        service.setImageId(dto.getImageId());
        service.setStatus(dto.getStatus());

        return mapToServiceDTO(chefServiceRepository.save(service));
    }

    @Transactional
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
                .category(service.getCategory())
                .itemType(service.getItemType())
                .isSignature(service.getIsSignature())
                .isNegotiable(service.getIsNegotiable())
                .imageId(service.getImageId())
                .status(service.getStatus())
                .build();
    }

    public ChefResponseDTO mapToDTO(Chef chef) {
        ChefResponseDTO dto = new ChefResponseDTO();
        dto.setId(chef.getId());
        dto.setName(chef.getName());
        dto.setBio(chef.getBio());
        dto.setExperience(chef.getExperience());
        dto.setAvatarUrl(chef.getAvatarUrl());
        dto.setCoverImageId(chef.getCoverImageId());
        dto.setRating(chef.getRating());
        dto.setReviews(chef.getReviewsCount());
        dto.setSlug(chef.getSlug());
        if (dto.getSpecialty() == null) {
            dto.setSpecialty(chef.getSpecialty() != null ? chef.getSpecialty() : "General");
        }
        dto.setIsActive(chef.getIsActive());
        dto.setWorkingHours(chef.getWorkingHours());

        if (chef.getAddress() != null) {
            dto.setAddressLine1(chef.getAddress().getAddressLine1());
            dto.setAddressLine2(chef.getAddress().getAddressLine2());
            dto.setHouseNumber(chef.getAddress().getAddressLine1()); // UI support
            dto.setStreetName(chef.getAddress().getAddressLine2());  // UI support
            dto.setCity(chef.getAddress().getCity());
            dto.setState(chef.getAddress().getState());
            dto.setPostalCode(chef.getAddress().getPostalCode());
            dto.setCountry(chef.getAddress().getCountry());
        }

        if (chef.getLegalProfile() != null) {
            dto.setLegalBusinessName(chef.getLegalProfile().getLegalBusinessName());
            dto.setGstNumber(chef.getLegalProfile().getGstNumber());
            dto.setPanNumber(chef.getLegalProfile().getPanNumber());
            dto.setBankAccountHolderName(chef.getLegalProfile().getBankAccountHolderName());
            dto.setBankAccountNumber(chef.getLegalProfile().getBankAccountNumber());
            dto.setBankIFSC(chef.getLegalProfile().getBankIFSC());
            dto.setBankName(chef.getLegalProfile().getBankName());
            dto.setFoodSafetyCertUrl(chef.getLegalProfile().getFoodSafetyCertUrl());
            dto.setCulinaryDiplomaUrl(chef.getLegalProfile().getCulinaryDiplomaUrl());
            dto.setIdProofType(chef.getLegalProfile().getIdProofType());
            dto.setIdProofNumber(chef.getLegalProfile().getIdProofNumber());
            dto.setIdProofUrl(chef.getLegalProfile().getIdProofUrl());
        }

        // Expansion fields from Chef
        dto.setFullName(chef.getFullName());
        dto.setContactNumber(chef.getContactNumber());
        dto.setCountryCode(chef.getCountryCode());
        dto.setCuisines(chef.getCuisines());
        dto.setDeliveryAvailability(chef.getDeliveryAvailability());
        dto.setBasePrice(chef.getBasePrice());
        dto.setWorkType(chef.getWorkType());
        dto.setSocialLinks(chef.getSocialLinks());

        dto.setPreference("Veg & Non-Veg");
        return dto;
    }
}
