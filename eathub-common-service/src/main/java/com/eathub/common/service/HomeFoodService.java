package com.eathub.common.service;

import com.eathub.common.dto.HomeFoodProfileUpdateDTO;
import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.entity.*;
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
public class HomeFoodService {

    private final HomeFoodProviderRepository repository;
    private final HomeFoodAddressRepository addressRepository;
    private final HomeFoodLegalProfileRepository legalProfileRepository;
    private final UserRepository userRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;

    public List<HomeFoodResponseDTO> getAllHomeFoods() {
        return repository.findAllWithDetails()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HomeFoodResponseDTO getHomeFoodById(String id) {
        return repository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
    }

    @Transactional
    public HomeFoodResponseDTO registerHomeFoodProvider(HomeFoodRequestDTO dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getOwnerId()));

        HomeFoodProvider provider = HomeFoodProvider.builder()
                .brandName(dto.getBrandName())
                .slug(dto.getSlug())
                .foodType(dto.getFoodType())
                .description(dto.getDescription())
                .imageId(dto.getImageId() != null ? dto.getImageId() : "home-food-default")
                .rating(5.0)
                .reviewsCount(0)
                .isActive(true)
                .owner(owner)
                .operationalStatus("OPEN")
                .build();

        return mapToDTO(repository.save(provider));
    }

    @Transactional
    public HomeFoodResponseDTO updateProfile(String id, HomeFoodProfileUpdateDTO dto) {
        HomeFoodProvider p = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        if (dto.getName() != null) p.setBrandName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getFoodType() != null) p.setFoodType(dto.getFoodType());
        if (dto.getIsActive() != null) p.setIsActive(dto.getIsActive());
        if (dto.getImageId() != null) {
            p.setImageId(dto.getImageId());
        }
        if (dto.getCoverImageId() != null) p.setCoverImageId(dto.getCoverImageId());
        if (dto.getWorkingHours() != null) p.setWorkingHours(dto.getWorkingHours());
        
        if (dto.getOperationalStatus() != null) {
            p.setOperationalStatus(dto.getOperationalStatus());
            p.setIsActive("OPEN".equalsIgnoreCase(dto.getOperationalStatus()));
        }

        // Expansion
        if (dto.getFullName() != null) p.setFullName(dto.getFullName());
        if (dto.getContactNumber() != null) p.setContactNumber(dto.getContactNumber());
        if (dto.getCountryCode() != null) p.setCountryCode(dto.getCountryCode());
        if (dto.getCuisines() != null) p.setCuisines(dto.getCuisines());
        if (dto.getSpecialtyDishes() != null) p.setSpecialtyDishes(dto.getSpecialtyDishes());
        if (dto.getDeliveryAvailability() != null) p.setDeliveryAvailability(dto.getDeliveryAvailability());

        return mapToDTO(repository.save(p));
    }

    @Transactional
    public HomeFoodResponseDTO updateAddress(String id, HomeFoodProfileUpdateDTO dto) {
        HomeFoodProvider p = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        HomeFoodAddress addr = addressRepository.findByHomeFoodProvider_Id(id).orElse(null);
        if (addr == null) {
            addr = new HomeFoodAddress();
            addr.setHomeFoodProvider(p);
        }

        if (dto.getAddressLine1() != null) addr.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) addr.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) addr.setCity(dto.getCity());
        if (dto.getState() != null) addr.setState(dto.getState());
        if (dto.getPostalCode() != null) addr.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null) addr.setCountry(dto.getCountry());

        addressRepository.save(addr);
        p.setAddress(addr);
        return mapToDTO(repository.save(p));
    }

    @Transactional
    public HomeFoodResponseDTO updateLegal(String id, HomeFoodProfileUpdateDTO dto) {
        HomeFoodProvider p = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        HomeFoodLegalProfile legal = legalProfileRepository.findByHomeFoodProvider_Id(id).orElse(null);
        if (legal == null) {
            legal = new HomeFoodLegalProfile();
            legal.setHomeFoodProvider(p);
        }

        if (dto.getLegalBusinessName() != null) legal.setLegalBusinessName(dto.getLegalBusinessName());
        if (dto.getGstNumber() != null) legal.setGstNumber(dto.getGstNumber());
        if (dto.getPanNumber() != null) legal.setPanNumber(dto.getPanNumber());
        if (dto.getFssaiLicenseNumber() != null) legal.setFssaiLicenseNumber(dto.getFssaiLicenseNumber());
        if (dto.getBusinessType() != null) legal.setBusinessType(dto.getBusinessType());
        if (dto.getBankAccountHolderName() != null) legal.setBankAccountHolderName(dto.getBankAccountHolderName());
        if (dto.getBankAccountNumber() != null) legal.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getBankIFSC() != null) legal.setBankIFSC(dto.getBankIFSC());
        if (dto.getBankName() != null) legal.setBankName(dto.getBankName());

        // Expansion
        if (dto.getIdProofType() != null) legal.setIdProofType(dto.getIdProofType());
        if (dto.getIdProofNumber() != null) legal.setIdProofNumber(dto.getIdProofNumber());
        if (dto.getIdProofUrl() != null) legal.setIdProofUrl(dto.getIdProofUrl());

        legalProfileRepository.save(legal);
        return mapToDTO(p);
    }

    @Transactional
    public MenuItemDTO addDish(String providerId, MenuItemRequestDTO dto) {
        HomeFoodProvider provider = repository.findById(providerId.trim())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        MenuCategory category;
        if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
            category = menuCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
            category = menuCategoryRepository.findByHomeFoodProvider_IdAndTitleIgnoreCase(provider.getId(), dto.getCategoryName())
                    .orElseGet(() -> {
                        MenuCategory newCat = MenuCategory.builder().title(dto.getCategoryName()).homeFoodProvider(provider).build();
                        return menuCategoryRepository.save(newCat);
                    });
        } else {
            throw new RuntimeException("Category must be provided");
        }

        MenuItem item = MenuItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(category)
                .homeFood(provider)
                .status(dto.getStatus() != null ? dto.getStatus() : "Available")
                .isSpecial(Boolean.TRUE.equals(dto.getIsSpecial()))
                .imageId(dto.getImageUrl())
                .build();

        return mapMenuItem(menuItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getHomeFoodMenu(String providerId) {
        return menuItemRepository.findByHomeFoodIdEager(providerId.trim())
                .stream()
                .map(this::mapMenuItem)
                .collect(Collectors.toList());
    }

    public HomeFoodResponseDTO mapToDTO(HomeFoodProvider p) {
        HomeFoodResponseDTO dto = new HomeFoodResponseDTO();
        dto.setId(p.getId());
        dto.setName(p.getBrandName());
        dto.setDescription(p.getDescription());
        dto.setFoodType(p.getFoodType());
        dto.setSlug(p.getSlug());
        dto.setRating(p.getRating());
        dto.setReviews(p.getReviewsCount());
        dto.setIsActive(p.getIsActive());
        dto.setOperationalStatus(p.getOperationalStatus());
        dto.setWorkingHours(p.getWorkingHours());
        dto.setImageId(p.getImageId());
        dto.setCoverImageId(p.getCoverImageId());
        dto.setCuisine(p.getCuisines());
        dto.setDeliveryTime(p.getAvgDeliveryTime() != null ? p.getAvgDeliveryTime() : 30);
        dto.setDeliveryFee(p.getBaseDeliveryFee() != null ? p.getBaseDeliveryFee() : 0.0);

        if (p.getAddress() != null) {
            HomeFoodAddress a = p.getAddress();
            dto.setAddressLine1(a.getAddressLine1());
            dto.setAddressLine2(a.getAddressLine2());
            dto.setCity(a.getCity());
            dto.setState(a.getState());
            dto.setPostalCode(a.getPostalCode());
            dto.setCountry(a.getCountry());
            dto.setLatitude(a.getLatitude());
            dto.setLongitude(a.getLongitude());
        }
        if (p.getLegalProfile() != null) {
            HomeFoodLegalProfile l = p.getLegalProfile();
            dto.setLegalBusinessName(l.getLegalBusinessName());
            dto.setGstNumber(l.getGstNumber());
            dto.setPanNumber(l.getPanNumber());
            dto.setFssaiLicenseNumber(l.getFssaiLicenseNumber());
            dto.setBusinessType(l.getBusinessType());
            dto.setBankAccountHolderName(l.getBankAccountHolderName());
            dto.setBankAccountNumber(l.getBankAccountNumber());
            dto.setBankIFSC(l.getBankIFSC());
            dto.setBankName(l.getBankName());
            dto.setIdProofType(l.getIdProofType());
            dto.setIdProofNumber(l.getIdProofNumber());
            dto.setIdProofUrl(l.getIdProofUrl());
        }

        // Expansion fields from Provider
        dto.setFullName(p.getFullName());
        dto.setContactNumber(p.getContactNumber());
        dto.setCountryCode(p.getCountryCode());
        dto.setCuisines(p.getCuisines());
        dto.setSpecialtyDishes(p.getSpecialtyDishes());
        dto.setDeliveryAvailability(p.getDeliveryAvailability());

        return dto;
    }

    private MenuItemDTO mapMenuItem(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .isSpecial(Boolean.TRUE.equals(item.getIsSpecial()))
                .imageId(item.getImageId())
                .category(item.getCategory() != null ? item.getCategory().getTitle() : "General")
                .providerId(item.getHomeFood() != null ? item.getHomeFood().getId() : null)
                .providerName(item.getHomeFood() != null ? item.getHomeFood().getBrandName() : null)
                .providerType("home-food")
                .providerSlug(item.getHomeFood() != null ? item.getHomeFood().getSlug() : null)
                .build();
    }
}