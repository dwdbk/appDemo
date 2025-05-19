package com.opera.shows.service.dto;

import com.opera.shows.model.ShowSinger;
import lombok.Data;

import java.util.UUID;

@Data
public class ShowSingerDTO {
    private UUID id;
    private UUID showId;
    private UUID singerId;
    private String characterName;
    private String role;
    
    // For GraphQL
    private SingerDTO singer;
    
    public static ShowSingerDTO fromEntity(ShowSinger showSinger) {
        if (showSinger == null) return null;
        
        ShowSingerDTO dto = new ShowSingerDTO();
        dto.setId(showSinger.getId());
        dto.setShowId(showSinger.getShow().getId());
        dto.setSingerId(showSinger.getSinger().getId());
        dto.setCharacterName(showSinger.getCharacterName());
        dto.setRole(showSinger.getRole());
        
        return dto;
    }
    
    public ShowSinger toEntity() {
        ShowSinger showSinger = new ShowSinger();
        showSinger.setId(this.id);
        // Note: show and singer references should be set separately
        showSinger.setCharacterName(this.characterName);
        showSinger.setRole(this.role);
        
        return showSinger;
    }
}
