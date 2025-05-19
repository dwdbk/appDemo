package com.opera.shows.service.dto;

import com.opera.shows.model.Opera;
import lombok.Data;

import java.time.Year;

/**
 * DTO for Opera from the Opera Service.
 * Used for GraphQL federation.
 */
@Data
public class OperaDTO {
    private String id;
    private String title;
    private String description;
    private Year premiereYear;
    private String composer;
    private String librettist;
    private String language;
    
    public static OperaDTO fromOpera(Opera opera) {
        if (opera == null) return null;
        
        OperaDTO dto = new OperaDTO();
        dto.setId(opera.getId());
        dto.setTitle(opera.getTitle());
        dto.setDescription(opera.getDescription());
        dto.setPremiereYear(opera.getPremiereYear());
        dto.setComposer(opera.getComposer());
        dto.setLibrettist(opera.getLibrettist());
        dto.setLanguage(opera.getLanguage());
        
        return dto;
    }
}
