package com.eathub.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChefRequestDTO {
    private String name;
    private String bio;
    private String experience;
    private String avatarUrl;
    private String ownerId; // Links to User table
}