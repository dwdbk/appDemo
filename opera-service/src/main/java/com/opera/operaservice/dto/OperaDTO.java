package com.opera.operaservice.dto;

import com.opera.operaservice.model.Opera;
import lombok.Data;

import java.time.Year;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class OperaDTO {
    private UUID id;
    private String title;
    private String description;
    private Year premiereYear;
    private String composer;
    private String librettist;
    private String language;
    private Set<ActDTO> acts = new HashSet<>();
    private Set<CharacterDTO> characters = new HashSet<>();
    private Set<DecorDTO> decors = new HashSet<>();
    
    // For GraphQL federation
    private Set<ShowDTO> shows = new HashSet<>();
    
    public static OperaDTO fromEntity(Opera opera) {
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
    
    public Opera toEntity() {
        Opera opera = new Opera();
        opera.setId(this.id);
        opera.setTitle(this.title);
        opera.setDescription(this.description);
        opera.setPremiereYear(this.premiereYear);
        opera.setComposer(this.composer);
        opera.setLibrettist(this.librettist);
        opera.setLanguage(this.language);
        
        return opera;
    }
}
