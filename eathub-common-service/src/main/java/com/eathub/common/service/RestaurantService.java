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
    private final UserRepository userRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantAddressRepository addressRepository;
    private final RestaurantLegalProfileRepository legalProfileRepository;

    public List<RestaurantResponseDTO> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public RestaurantResponseDTO getRestaurantBySlug(String slug) {
        return restaurantRepository.findBySlug(slug)
                .map(this::mapToResponseDTO)
                .or(() -> restaurantRepository.findById(slug).map(this::mapToResponseDTO))
                .orElseThrow(() -> new RuntimeException("Restaurant not found with slug or ID: " + slug));
    }

    /** Returns the full profile (including address + legal) for settings form pre-fill. */
    public RestaurantResponseDTO getProfile(String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return mapToResponseDTO(restaurant);
    }

    /** Upserts core info, address, and legal profile in a single transaction. */
    @Transactional
    public RestaurantResponseDTO updateProfile(String restaurantId, RestaurantProfileUpdateDTO dto) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        // ── Core restaurant fields ─────────────────────────────────────────
        if (dto.getName() != null && !dto.getName().isBlank()) restaurant.setName(dto.getName());
        if (dto.getDescription() != null)  restaurant.setDescription(dto.getDescription());
        if (dto.getCuisineType() != null)  restaurant.setCuisineType(dto.getCuisineType());
        if (dto.getImageId() != null)      restaurant.setImageId(dto.getImageId());
        if (dto.getCoverImageId() != null) restaurant.setCoverImageId(dto.getCoverImageId());
        restaurantRepository.save(restaurant);

        // ── Address (upsert) ───────────────────────────────────────────────
        RestaurantAddress address = addressRepository.findByRestaurant_Id(restaurantId)
                .orElseGet(() -> { RestaurantAddress a = new RestaurantAddress(); a.setRestaurant(restaurant); return a; });
        if (dto.getAddressLine1() != null) address.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) address.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null)         address.setCity(dto.getCity());
        if (dto.getState() != null)        address.setState(dto.getState());
        if (dto.getPostalCode() != null)   address.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null)      address.setCountry(dto.getCountry());
        addressRepository.save(address);

        // ── Legal / Banking (upsert) ───────────────────────────────────────
        RestaurantLegalProfile legal = legalProfileRepository.findByRestaurant_Id(restaurantId)
                .orElseGet(() -> { RestaurantLegalProfile l = new RestaurantLegalProfile(); l.setRestaurant(restaurant); return l; });
        if (dto.getLegalBusinessName() != null)     legal.setLegalBusinessName(dto.getLegalBusinessName());
        if (dto.getGstNumber() != null)             legal.setGstNumber(dto.getGstNumber());
        if (dto.getPanNumber() != null)             legal.setPanNumber(dto.getPanNumber());
        if (dto.getFssaiLicenseNumber() != null)    legal.setFssaiLicenseNumber(dto.getFssaiLicenseNumber());
        if (dto.getBusinessType() != null)          legal.setBusinessType(dto.getBusinessType());
        if (dto.getBankAccountHolderName() != null) legal.setBankAccountHolderName(dto.getBankAccountHolderName());
        if (dto.getBankAccountNumber() != null)     legal.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getBankIFSC() != null)              legal.setBankIFSC(dto.getBankIFSC());
        if (dto.getBankName() != null)              legal.setBankName(dto.getBankName());
        legalProfileRepository.save(legal);

        return getProfile(restaurantId);
    }

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

        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setCuisineType(dto.getCuisineType());
        restaurant.setSlug(dto.getSlug());
        restaurant.setOwner(owner);
        restaurant.setType(dto.getRestaurantType() != null ? dto.getRestaurantType() : "General");
        restaurant.setRating(4.0);
        restaurant.setReviewsCount(0);
        restaurant.setIsOpen(true);
        restaurant.setOperationalStatus("OPEN");

        RestaurantAddress address = RestaurantAddress.builder()
                .restaurant(restaurant)
                .addressLine1(dto.getAddressLine1())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPincode())
                .country("India")
                .build();
        restaurant.setAddress(address);

        RestaurantLegalProfile legal = RestaurantLegalProfile.builder()
                .restaurant(restaurant)
                .gstNumber(dto.getGstNumber())
                .bankAccountNumber(dto.getBankAccountNumber())
                .legalBusinessName(dto.getName())
                .build();
        restaurant.setLegalProfile(legal);

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponseDTO(savedRestaurant);
    }

    private RestaurantResponseDTO mapToResponseDTO(Restaurant restaurant) {
        RestaurantResponseDTO dto = new RestaurantResponseDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setCuisineType(restaurant.getCuisine());
        dto.setSlug(restaurant.getSlug());
        dto.setRating(restaurant.getRating());
        dto.setReviewsCount(restaurant.getReviewsCount());
        dto.setIsOpen(restaurant.getIsOpen());
        dto.setImageId(restaurant.getImageId());
        dto.setCoverImageId(restaurant.getCoverImageId());

        // Address
        addressRepository.findByRestaurant_Id(restaurant.getId()).ifPresent(addr -> {
            dto.setAddressLine1(addr.getAddressLine1());
            dto.setAddressLine2(addr.getAddressLine2());
            dto.setCity(addr.getCity());
            dto.setState(addr.getState());
            dto.setPostalCode(addr.getPostalCode());
            dto.setCountry(addr.getCountry());
        });

        // Legal / Banking
        legalProfileRepository.findByRestaurant_Id(restaurant.getId()).ifPresent(legal -> {
            dto.setLegalBusinessName(legal.getLegalBusinessName());
            dto.setGstNumber(legal.getGstNumber());
            dto.setPanNumber(legal.getPanNumber());
            dto.setFssaiLicenseNumber(legal.getFssaiLicenseNumber());
            dto.setBusinessType(legal.getBusinessType());
            dto.setBankAccountHolderName(legal.getBankAccountHolderName());
            dto.setBankAccountNumber(legal.getBankAccountNumber());
            dto.setBankIFSC(legal.getBankIFSC());
            dto.setBankName(legal.getBankName());
        });

        return dto;
    }

    @Transactional
    public void addDish(String restaurant_Id, MenuItemRequestDTO dto) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurant_Id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Restaurant ID " + restaurant_Id + " not found"));

            MenuCategory category;
            if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
                category = menuCategoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category ID " + dto.getCategoryId() + " missing"));
            } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
                category = menuCategoryRepository
                        .findByRestaurant_IdAndTitleIgnoreCase(restaurant_Id, dto.getCategoryName())
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

            menuItemRepository.save(newItem);
            System.out.println(" SUCCESS: Data saved to database for: " + dto.getName());

        } catch (Exception e) {
            System.err.println(" BACKEND ERROR: " + e.getMessage());
            throw e;
        }
    }

    public RestaurantResponseDTO getRestaurantById(String id) {
        return restaurantRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public java.util.Map<String, Object> getDashboardOverview(String id) {
        return java.util.Map.of("status", "active");
    }
}