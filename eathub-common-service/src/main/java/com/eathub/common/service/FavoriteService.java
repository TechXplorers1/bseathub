package com.eathub.common.service;

import com.eathub.common.entity.*;
import com.eathub.common.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final HomeFoodProviderRepository homeFoodProviderRepository;
    private final ChefRepository chefRepository;

    private final RestaurantService restaurantService;
    private final HomeFoodService homeFoodService;
    private final ChefManagementService chefService;
    private final MenuService menuService;

    @Transactional
    public boolean toggleFavorite(String userId, String targetId, String targetType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (favoriteRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)) {
            favoriteRepository.deleteByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
            return false;
        } else {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .targetId(targetId)
                    .targetType(targetType)
                    .build();
            favoriteRepository.save(favorite);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<String> getFavoriteItemIds(String userId, String targetType) {
        return favoriteRepository.findByUserIdAndTargetType(userId, targetType)
                .stream()
                .map(Favorite::getTargetId)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> getAllFavoriteIds(String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        Map<String, List<String>> grouped = new HashMap<>();
        
        favorites.forEach(f -> {
            grouped.computeIfAbsent(f.getTargetType(), k -> new java.util.ArrayList<>()).add(f.getTargetId());
        });
        
        return grouped;
    }

    @Transactional(readOnly = true)
    public List<Object> getDetailedFavorites(String userId, String targetType) {
        List<String> ids = getFavoriteItemIds(userId, targetType);

        if ("RESTAURANT".equalsIgnoreCase(targetType)) {
            return restaurantRepository.findAllById(ids).stream()
                    .map(restaurantService::mapToResponseDTO)
                    .map(Object.class::cast)
                    .collect(Collectors.toList());
        }
        if ("HOME_FOOD".equalsIgnoreCase(targetType)) {
            return homeFoodProviderRepository.findAllById(ids).stream()
                    .map(homeFoodService::mapToDTO)
                    .map(Object.class::cast)
                    .collect(Collectors.toList());
        }
        if ("CHEF".equalsIgnoreCase(targetType)) {
            return chefRepository.findAllById(ids).stream()
                    .map(chefService::mapToResponse)
                    .map(Object.class::cast)
                    .collect(Collectors.toList());
        }
        if ("MENU_ITEM".equalsIgnoreCase(targetType)) {
            return menuItemRepository.findAllById(ids).stream()
                    .map(menuService::mapToDTO)
                    .map(Object.class::cast)
                    .collect(Collectors.toList());
        }

        return List.of();
    }
}
