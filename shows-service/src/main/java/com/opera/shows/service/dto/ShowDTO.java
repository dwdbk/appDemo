package com.opera.shows.service.dto;

import com.opera.shows.model.Show;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class ShowDTO {
    private UUID id;
    private UUID operaId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private String description;
    private String imageUrl;
    private Show.ShowStatus status;
    private Set<ShowSingerDTO> cast = new HashSet<>();
    
    // For GraphQL Federation
    private OperaDTO opera;
    
    public static ShowDTO fromEntity(Show show) {
        if (show == null) return null;
        
        ShowDTO dto = new ShowDTO();
        dto.setId(show.getId());
        dto.setOperaId(show.getOperaId());
        dto.setStartTime(show.getStartTime());
        dto.setEndTime(show.getEndTime());
        dto.setVenue(show.getVenue());
        dto.setDescription(show.getDescription());
        dto.setImageUrl(show.getImageUrl());
        dto.setStatus(show.getStatus());
        
        return dto;
    }
    
    public Show toEntity() {
        Show show = new Show();
        show.setId(this.id);
        show.setOperaId(this.operaId);
        show.setStartTime(this.startTime);
        show.setEndTime(this.endTime);
        show.setVenue(this.venue);
        show.setDescription(this.description);
        show.setImageUrl(this.imageUrl);
        show.setStatus(this.status);
        
        return show;
    }
}
