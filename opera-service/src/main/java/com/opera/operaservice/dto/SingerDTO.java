package com.opera.operaservice.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * External DTO for Singer from the Shows Service.
 * Used for GraphQL federation.
 */
@Data
public class SingerDTO {
    private String id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String nationality;
    private String bio;
    private String imageUrl;
    private String voiceType;
}
