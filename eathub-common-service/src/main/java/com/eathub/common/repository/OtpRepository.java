package com.eathub.common.repository;

import com.eathub.common.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, String> {
    Optional<Otp> findTopByEmailOrderByExpiryTimeDesc(String email);
    void deleteByEmail(String email);
}
