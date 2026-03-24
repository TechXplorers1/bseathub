package com.eathub.common.repository;

import com.eathub.common.entity.HomeFoodAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HomeFoodAddressRepository extends JpaRepository<HomeFoodAddress, String> {
    Optional<HomeFoodAddress> findByHomeFoodProvider_Id(String homeFoodId);
}
