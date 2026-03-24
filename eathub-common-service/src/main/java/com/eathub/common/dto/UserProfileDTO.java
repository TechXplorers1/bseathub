package com.eathub.common.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfileDTO {
    private String id;
    private String email;
    private String name;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String countryCode;
    private String houseNumber;
    private String street;
    private String area;
    private String city;
    private String state;
    private String country;
    private String avatarUrl;
}
