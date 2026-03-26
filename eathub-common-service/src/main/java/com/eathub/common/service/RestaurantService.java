package com.eathub.common.service;

import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.dto.RestaurantCreateRequestDTO;
import com.eathub.common.dto.RestaurantProfileUpdateDTO;
import com.eathub.common.dto.RestaurantResponseDTO;
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
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantAddressRepository addressRepository;
    private final RestaurantLegalProfileRepository legalProfileRepository;
    private final UserRepository userRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;

    // ── Fetch all ──────────────────────────────────────────────────────────
    public List<RestaurantResponseDTO> getAllRestaurants() {
        return restaurantRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Fetch by slug ─────────────────────────────────────────────────────
    public RestaurantResponseDTO getRestaurantBySlug(String slug) {
        return restaurantRepository.findBySlug(slug)
                .map(this::mapToResponseDTO)
                .or(() -> restaurantRepository.findById(slug).map(this::mapToResponseDTO))
                .orElseThrow(() -> new RuntimeException("Restaurant not found with slug or ID: " + slug));
    }

    // ── Fetch by ID ───────────────────────────────────────────────────────
    public RestaurantResponseDTO getRestaurantById(String id) {
        return restaurantRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    /** Returns the full profile for settings form pre-fill. */
    public RestaurantResponseDTO getProfile(String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return mapToResponseDTO(restaurant);
    }

    /** SECTION 1: Update Core Profile (Name, Description, Cuisine, Images) */
    @Transactional
    public RestaurantResponseDTO updateProfile(String restaurantId, RestaurantProfileUpdateDTO dto) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        if (dto.getName() != null && !dto.getName().isBlank())
            r.setName(dto.getName());
        if (dto.getDescription() != null)
            r.setDescription(dto.getDescription());
        if (dto.getCuisineType() != null)
            r.setCuisineType(dto.getCuisineType());
        if (dto.getRestaurantType() != null)
            r.setType(dto.getRestaurantType());
        if (dto.getImageId() != null) {
            r.setImageId(dto.getImageId());
        }
        if (dto.getCoverImageId() != null)
            r.setCoverImageId(dto.getCoverImageId());
        
        if (dto.getIsOpen() != null) {
            r.setIsOpen(dto.getIsOpen());
            r.setOperationalStatus(dto.getIsOpen() ? "OPEN" : "CLOSED");
        }
            
        if (dto.getWorkingHours() != null)
            r.setWorkingHours(dto.getWorkingHours());

        return mapToResponseDTO(restaurantRepository.save(r));
    }

    /** SECTION 2: Update Address (Separate Table) */
    @Transactional
    public RestaurantResponseDTO updateAddress(String restaurantId, RestaurantProfileUpdateDTO dto) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        RestaurantAddress addr = r.getAddress();
        if (addr == null) {
            addr = new RestaurantAddress();
            addr.setRestaurant(r);
            r.setAddress(addr);
        }

        if (dto.getAddressLine1() != null)
            addr.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null)
            addr.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null)
            addr.setCity(dto.getCity());
        if (dto.getState() != null)
            addr.setState(dto.getState());
        if (dto.getPostalCode() != null)
            addr.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null)
            addr.setCountry(dto.getCountry());

        addressRepository.save(addr);
        return mapToResponseDTO(r);
    }

    /** SECTION 3: Update Legal / Banking (Separate Table) */
    @Transactional
    public RestaurantResponseDTO updateLegalProfile(String restaurantId, RestaurantProfileUpdateDTO dto) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        RestaurantLegalProfile legal = r.getLegalProfile();
        if (legal == null) {
            legal = new RestaurantLegalProfile();
            legal.setRestaurant(r);
            r.setLegalProfile(legal);
        }

        legal.setLegalBusinessName(dto.getLegalBusinessName());
        legal.setGstNumber(dto.getGstNumber());
        legal.setPanNumber(dto.getPanNumber());
        legal.setFssaiLicenseNumber(dto.getFssaiLicenseNumber());
        legal.setBusinessType(dto.getBusinessType());
        legal.setBankAccountHolderName(dto.getBankAccountHolderName());
        legal.setBankAccountNumber(dto.getBankAccountNumber());
        legal.setBankIFSC(dto.getBankIFSC());
        legal.setBankName(dto.getBankName());

        legalProfileRepository.save(legal);
        return mapToResponseDTO(r);
    }

    // ── Register (partner onboarding) ─────────────────────────────────────
    @Transactional
    public RestaurantResponseDTO registerRestaurant(RestaurantCreateRequestDTO dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(dto.getOwnerId());
                    newUser.setName(dto.getName() + " Partner");
                    newUser.setEmail(dto.getOwnerId() + "@eathub.com");
                    newUser.setPassword("default_pass");
                    newUser.setRole(UserRole.RESTAURANT);
                    return userRepository.saveAndFlush(newUser);
                });

        Restaurant r = new Restaurant();
        r.setName(dto.getName());
        r.setDescription(dto.getDescription());
        r.setCuisineType(dto.getCuisineType());
        r.setSlug(dto.getSlug());
        r.setOwner(owner);
        r.setType(dto.getRestaurantType() != null ? dto.getRestaurantType() : "General");
        r.setRating(4.0);
        r.setReviewsCount(0);
        r.setIsOpen(true);
        r.setOperationalStatus("OPEN");

        // Set Address
        RestaurantAddress addr = new RestaurantAddress();
        addr.setAddressLine1(dto.getAddressLine1());
        addr.setCity(dto.getCity());
        addr.setState(dto.getState());
        addr.setPostalCode(dto.getPincode());
        addr.setCountry("India");
        addr.setRestaurant(r);
        r.setAddress(addr);

        // Set Legal
        RestaurantLegalProfile legal = new RestaurantLegalProfile();
        legal.setGstNumber(dto.getGstNumber());
        legal.setBankAccountNumber(dto.getBankAccountNumber());
        legal.setLegalBusinessName(dto.getName());
        legal.setRestaurant(r);
        r.setLegalProfile(legal);

        return mapToResponseDTO(restaurantRepository.save(r));
    }

    // ── Map entity → DTO (flattens for frontend) ──────────────────────────
    private RestaurantResponseDTO mapToResponseDTO(Restaurant r) {
        RestaurantResponseDTO dto = new RestaurantResponseDTO();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setDescription(r.getDescription());
        dto.setCuisineType(r.getCuisine());
        dto.setRestaurantType(r.getType());
        dto.setSlug(r.getSlug());
        dto.setRating(r.getRating());
        dto.setReviewsCount(r.getReviewsCount());
        dto.setIsOpen(r.getIsOpen());
        dto.setWorkingHours(r.getWorkingHours());
        dto.setImageId(r.getImageId());
        dto.setCoverImageId(r.getCoverImageId());

        RestaurantAddress addr = r.getAddress();
        if (addr != null) {
            dto.setAddressLine1(addr.getAddressLine1());
            dto.setAddressLine2(addr.getAddressLine2());
            dto.setCity(addr.getCity());
            dto.setState(addr.getState());
            dto.setPostalCode(addr.getPostalCode());
            dto.setCountry(addr.getCountry());
        }

        RestaurantLegalProfile legal = r.getLegalProfile();
        if (legal != null) {
            dto.setLegalBusinessName(legal.getLegalBusinessName());
            dto.setGstNumber(legal.getGstNumber());
            dto.setPanNumber(legal.getPanNumber());
            dto.setFssaiLicenseNumber(legal.getFssaiLicenseNumber());
            dto.setBusinessType(legal.getBusinessType());
            dto.setBankAccountHolderName(legal.getBankAccountHolderName());
            dto.setBankAccountNumber(legal.getBankAccountNumber());
            dto.setBankIFSC(legal.getBankIFSC());
            dto.setBankName(legal.getBankName());
        }
        return dto;
    }

    @Transactional
    public com.eathub.common.dto.MenuItemDTO addDish(String restaurantId, MenuItemRequestDTO dto) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Restaurant ID " + restaurantId + " not found"));

            MenuCategory category;
            if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
                category = menuCategoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category ID " + dto.getCategoryId() + " missing"));
            } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
                category = menuCategoryRepository
                        .findByRestaurant_IdAndTitleIgnoreCase(restaurantId, dto.getCategoryName())
                        .orElseGet(() -> {
                            MenuCategory newCat = MenuCategory.builder()
                                    .title(dto.getCategoryName())
                                    .restaurant(restaurant)
                                    .build();
                            return menuCategoryRepository.save(newCat);
                        });
            } else {
                throw new RuntimeException("Category ID or Name must be provided");
            }

            MenuItem newItem = MenuItem.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .price(dto.getPrice())
                    .category(category)
                    .restaurant(restaurant)
                    .status(dto.getStatus() != null ? dto.getStatus() : "Available")
                    .isSpecial(dto.getIsSpecial() != null ? dto.getIsSpecial() : false)
                    .imageId(dto.getImageUrl())
                    .build();

            return mapToMenuItemDTO(menuItemRepository.save(newItem));
        } catch (Exception e) {
            throw e;
        }
    }

    private com.eathub.common.dto.MenuItemDTO mapToMenuItemDTO(MenuItem item) {
        return com.eathub.common.dto.MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .isSpecial(item.getIsSpecial())
                .imageId(item.getImageId())
                .category(item.getCategory() != null ? item.getCategory().getTitle() : "General")
                .build();
    }

    public java.util.Map<String, Object> getDashboardOverview(String id) {
        return java.util.Map.of("status", "active");
    }

}