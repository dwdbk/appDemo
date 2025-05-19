package com.opera.operaservice.dto;

import lombok.Data;

/**
 * External DTO for ShowSinger from the Shows Service.
 * Used for GraphQL federation.
 */
@Data
public class ShowSingerDTO {
    private String id;
    private String showId;
    private String singerId;
    private String characterName;
    private String role;
    
    // For GraphQL
    private SingerDTO singer;
}
