package com.opera.operaservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * External DTO for Shows from the Shows Service.
 * Used for GraphQL federation.
 */
@Data
public class ShowDTO {
    private String id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private String description;
    private String imageUrl;
    private String status;
}
