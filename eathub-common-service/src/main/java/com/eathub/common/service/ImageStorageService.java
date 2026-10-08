package com.eathub.common.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final String UPLOAD_DIR = "uploads/images/";
    private static final String SERVER_URL = "http://localhost:8081";

    public ImageStorageService() {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public String storeImageIfBase64(String imageString) {
        if (!StringUtils.hasText(imageString)) {
            return imageString;
        }

        if (imageString.startsWith("data:image/")) {
            try {
                String[] parts = imageString.split(",");
                if (parts.length != 2)
                    return imageString;

                String header = parts[0];
                String base64Data = parts[1];

                String extension = ".jpg";
                if (header.contains("png"))
                    extension = ".png";
                else if (header.contains("gif"))
                    extension = ".gif";
                else if (header.contains("webp"))
                    extension = ".webp";

                byte[] imageBytes = Base64.getDecoder().decode(base64Data);

                String fileName = UUID.randomUUID().toString() + extension;
                File outputFile = new File(UPLOAD_DIR + fileName);

                try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                    fos.write(imageBytes);
                }

                return SERVER_URL + "/api/uploads/images/" + fileName;

            } catch (Exception e) {
                System.err.println("Failed to process base64 image: " + e.getMessage());
                return imageString;
            }
        }

        return imageString;
    }
}
