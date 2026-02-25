package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HomeFoodProviderRepository extends JpaRepository<HomeFoodProvider, String> {
    Optional<HomeFoodProvider> findBySlug(String slug);

    Optional<HomeFoodProvider> findByOwnerId(String ownerId);
}
