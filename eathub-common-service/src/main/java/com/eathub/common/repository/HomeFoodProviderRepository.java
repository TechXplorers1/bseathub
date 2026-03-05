package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodProvider;
import com.eathub.common.entity.MenuItem;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.Set;

public interface HomeFoodProviderRepository extends JpaRepository<HomeFoodProvider, String> {
    Optional<HomeFoodProvider> findBySlug(String slug);

    Optional<HomeFoodProvider> findByOwnerId(String ownerId);
}
