package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodLegalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HomeFoodLegalProfileRepository extends JpaRepository<HomeFoodLegalProfile, String> {
    Optional<HomeFoodLegalProfile> findByHomeFoodProvider_Id(String homeFoodId);
}
