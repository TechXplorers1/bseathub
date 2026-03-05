package com.eathub.common.service;

import com.eathub.common.dto.HomeFoodRequestDTO;
import com.eathub.common.dto.HomeFoodResponseDTO;
import com.eathub.common.dto.MenuItemDTO;
import com.eathub.common.dto.MenuItemRequestDTO;
import com.eathub.common.entity.MenuCategory;
import com.eathub.common.entity.MenuItem;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.User;
import com.eathub.common.repository.HomeFoodProviderRepository;
import com.eathub.common.repository.MenuCategoryRepository;
import com.eathub.common.repository.MenuItemRepository;
import com.eathub.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeFoodService {

        private final HomeFoodProviderRepository repository;
        private final UserRepository userRepository;
        private final MenuCategoryRepository menuCategoryRepository;
        private final MenuItemRepository menuItemRepository;

        // ================= GET ALL PROVIDERS =================

        public List<HomeFoodResponseDTO> getAllHomeFoods() {
                return repository.findAll()
                                .stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        // ================= REGISTER PROVIDER =================

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
                                .build();

                return mapToDTO(repository.save(provider));
        }

        // ================= ADD DISH =================

        @Transactional
        public MenuItemDTO addDish(String providerId, MenuItemRequestDTO dto) {

                System.out.println("DEBUG: Adding dish for HomeFoodProviderID: [" + providerId + "]");

                HomeFoodProvider provider = repository.findById(providerId.trim())
                                .orElseThrow(() -> new RuntimeException(
                                                "Home Food Provider not found with ID: " + providerId));

                System.out.println("DEBUG: Found Provider: " + provider.getBrandName());

                MenuCategory category;

                if (dto.getCategoryId() != null && !dto.getCategoryId().isEmpty()) {
                        System.out.println("DEBUG: Using Category ID: " + dto.getCategoryId());
                        category = menuCategoryRepository.findById(dto.getCategoryId())
                                        .orElseThrow(() -> new RuntimeException("Category not found"));

                } else if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
                        System.out.println("DEBUG: Finding/Creating Category by Name: " + dto.getCategoryName());
                        category = menuCategoryRepository
                                        .findByHomeFoodProvider_IdAndTitleIgnoreCase(provider.getId(),
                                                        dto.getCategoryName())
                                        .orElseGet(() -> {
                                                System.out.println("DEBUG: Category not found, creating new: "
                                                                + dto.getCategoryName());
                                                MenuCategory newCategory = MenuCategory.builder()
                                                                .title(dto.getCategoryName())
                                                                .homeFoodProvider(provider)
                                                                .build();
                                                return menuCategoryRepository.save(newCategory);
                                        });

                } else {
                        throw new RuntimeException("Category ID or Category Name must be provided");
                }

                System.out.println("DEBUG: Creating MenuItem: " + dto.getName() + " with price " + dto.getPrice());

                MenuItem item = MenuItem.builder()
                                .name(dto.getName())
                                .description(dto.getDescription())
                                .price(dto.getPrice())
                                .category(category)
                                .homeFood(provider)
                                .restaurant(null)
                                .status(dto.getStatus() != null ? dto.getStatus() : "Available")
                                .isSpecial(dto.getIsSpecial() != null ? dto.getIsSpecial() : false)
                                .imageId(dto.getImageUrl())
                                .build();

                MenuItem savedItem = menuItemRepository.save(item);
                System.out.println("DEBUG: MenuItem Saved with ID: " + savedItem.getId());
                return mapMenuItem(savedItem);
        }

        // ================= GET MENU =================

        @Transactional(readOnly = true)
        public List<MenuItemDTO> getHomeFoodMenu(String providerId) {

                HomeFoodProvider provider = repository.findById(providerId.trim())
                                .orElseThrow(() -> new RuntimeException(
                                                "Home Food Provider not found with ID: " + providerId));

                return menuItemRepository.findByHomeFoodIdEager(provider.getId())
                                .stream()
                                .map(this::mapMenuItem)
                                .toList();
        }

        // ================= UPDATE ITEM =================

        @Transactional
        public MenuItemDTO updateMenuItem(String itemId, MenuItemRequestDTO dto) {

                MenuItem item = menuItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Menu item not found"));

                item.setName(dto.getName());
                item.setDescription(dto.getDescription());
                item.setPrice(dto.getPrice());
                item.setStatus(dto.getStatus());
                item.setIsSpecial(dto.getIsSpecial());
                item.setImageId(dto.getImageUrl());
                item.setRestaurant(null); // Ensure restaurant is null for home food updates

                return mapMenuItem(menuItemRepository.save(item));
        }

        // ================= DELETE ITEM =================

        public void deleteMenuItem(String itemId) {
                menuItemRepository.deleteById(itemId);
        }

        // ================= DTO MAPPERS =================

        private HomeFoodResponseDTO mapToDTO(HomeFoodProvider provider) {
                HomeFoodResponseDTO dto = new HomeFoodResponseDTO();
                dto.setId(provider.getId());
                dto.setName(provider.getBrandName());
                dto.setSlug(provider.getSlug());
                dto.setCuisine(provider.getFoodType());
                dto.setRating(provider.getRating());
                dto.setReviews(provider.getReviewsCount());
                dto.setImageId(provider.getImageId());
                dto.setDeliveryTime(30);
                dto.setDeliveryFee(0.0);
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
                                .category(getCategoryTitleSafe(item.getCategory()))
                                .build();
        }

        private String getCategoryTitleSafe(MenuCategory category) {
                if (category == null)
                        return null;
                try {
                        return category.getTitle();
                } catch (Exception e) {
                        return "General";
                }
        }
}