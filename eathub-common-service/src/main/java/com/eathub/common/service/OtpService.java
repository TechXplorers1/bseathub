package com.eathub.common.service;

import com.eathub.common.entity.Otp;
import com.eathub.common.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Transactional
    public void generateAndSendOtp(String email) {
        String code = String.format("%06d", new Random().nextInt(1000000));

        // Delete old OTPs for this email
        otpRepository.deleteByEmail(email);

        Otp otp = Otp.builder()
                .email(email)
                .otpCode(code)
                .expiryTime(LocalDateTime.now().plusMinutes(5)) // 5 minutes expiry
                .build();

        otpRepository.save(otp);

        sendEmail(email, code);
    }

    private void sendEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Eat Hub Verification Code");
        message.setText("Your OTP for restaurant registration is: " + code + "\n\nThis code expires in 5 minutes.");
        
        try {
            System.out.println("Attempting to send OTP email to " + to + " via " + fromEmail);
            mailSender.send(message);
            System.out.println("OTP sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send OTP to " + to + ". Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email. Please check your SMTP configuration: " + e.getMessage());
        }
    }

    public boolean verifyOtp(String email, String code) {
        Optional<Otp> otpOpt = otpRepository.findTopByEmailOrderByExpiryTimeDesc(email);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        return otp.getOtpCode().equals(code);
    }
}
