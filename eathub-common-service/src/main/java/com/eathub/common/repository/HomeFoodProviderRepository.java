package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HomeFoodProviderRepository extends JpaRepository<HomeFoodProvider, String> {
    Optional<HomeFoodProvider> findBySlug(String slug);

    Optional<HomeFoodProvider> findByOwnerId(String ownerId);
}
