package com.eathub.common.service;

import com.eathub.common.entity.Chef;
import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.Restaurant;
import com.eathub.common.repository.ChefRepository;
import com.eathub.common.repository.HomeFoodProviderRepository;
import com.eathub.common.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DataMigrationService {

    private final RestaurantRepository restaurantRepository;
    private final ChefRepository chefRepository;
    private final HomeFoodProviderRepository homeFoodProviderRepository;
    private final com.eathub.common.repository.MenuItemRepository menuItemRepository;
    private final com.eathub.common.repository.ChefServiceRepository chefServiceRepository;
    private final ImageStorageService imageStorageService;

    @PostConstruct
    @Transactional
    public void migrateBase64Images() {
        System.out.println("Starting image data migration...");

        // Migrate Restaurants
        List<Restaurant> restaurants = restaurantRepository.findAll();
        boolean resUpdated = false;
        for (Restaurant r : restaurants) {
            boolean updated = false;
            if (r.getImageId() != null && r.getImageId().startsWith("data:image/")) {
                r.setImageId(imageStorageService.storeImageIfBase64(r.getImageId()));
                updated = true;
            }
            if (r.getCoverImageId() != null && r.getCoverImageId().startsWith("data:image/")) {
                r.setCoverImageId(imageStorageService.storeImageIfBase64(r.getCoverImageId()));
                updated = true;
            }
            if (updated) {
                restaurantRepository.save(r);
                resUpdated = true;
            }
        }
        if (resUpdated) System.out.println("Migrated restaurant images.");

        // Migrate Menu Items
        List<com.eathub.common.entity.MenuItem> menuItems = menuItemRepository.findAll();
        boolean miUpdated = false;
        for (com.eathub.common.entity.MenuItem mi : menuItems) {
            if (mi.getImageId() != null && mi.getImageId().startsWith("data:image/")) {
                mi.setImageId(imageStorageService.storeImageIfBase64(mi.getImageId()));
                menuItemRepository.save(mi);
                miUpdated = true;
            }
        }
        if (miUpdated) System.out.println("Migrated menu item images.");

        // Migrate Chef Services
        List<com.eathub.common.entity.ChefService> chefServices = chefServiceRepository.findAll();
        boolean csUpdated = false;
        for (com.eathub.common.entity.ChefService cs : chefServices) {
            if (cs.getImageId() != null && cs.getImageId().startsWith("data:image/")) {
                cs.setImageId(imageStorageService.storeImageIfBase64(cs.getImageId()));
                chefServiceRepository.save(cs);
                csUpdated = true;
            }
        }
        if (csUpdated) System.out.println("Migrated chef service images.");

        // Migrate Home Foods
        List<HomeFoodProvider> homeFoods = homeFoodProviderRepository.findAll();
        boolean hfUpdated = false;
        for (HomeFoodProvider h : homeFoods) {
            boolean updated = false;
            if (h.getImageId() != null && h.getImageId().startsWith("data:image/")) {
                h.setImageId(imageStorageService.storeImageIfBase64(h.getImageId()));
                updated = true;
            }
            if (h.getCoverImageId() != null && h.getCoverImageId().startsWith("data:image/")) {
                h.setCoverImageId(imageStorageService.storeImageIfBase64(h.getCoverImageId()));
                updated = true;
            }
            if (updated) {
                homeFoodProviderRepository.save(h);
                hfUpdated = true;
            }
        }
        if (hfUpdated) System.out.println("Migrated home food images.");

        // Migrate Chefs
        List<Chef> chefs = chefRepository.findAll();
        boolean chefUpdated = false;
        for (Chef c : chefs) {
            boolean updated = false;
            if (c.getAvatarUrl() != null && c.getAvatarUrl().startsWith("data:image/")) {
                c.setAvatarUrl(imageStorageService.storeImageIfBase64(c.getAvatarUrl()));
                updated = true;
            }
            if (c.getCoverImageId() != null && c.getCoverImageId().startsWith("data:image/")) {
                c.setCoverImageId(imageStorageService.storeImageIfBase64(c.getCoverImageId()));
                updated = true;
            }
            if (updated) {
                chefRepository.save(c);
                chefUpdated = true;
            }
        }
        if (chefUpdated) System.out.println("Migrated chef images.");

        System.out.println("Image data migration completed.");
    }
}
