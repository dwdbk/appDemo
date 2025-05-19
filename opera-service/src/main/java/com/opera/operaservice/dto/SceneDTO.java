package com.opera.operaservice.dto;

import com.opera.operaservice.model.Scene;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class SceneDTO {
    private UUID id;
    private String title;
    private String description;
    private Integer sequenceNumber;
    private UUID actId;
    private Set<MusicDTO> music = new HashSet<>();
    private Set<CharacterDTO> characters = new HashSet<>();
    private Set<DecorDTO> decors = new HashSet<>();
    
    // For GraphQL federation
    private ActDTO act;
    
    public static SceneDTO fromEntity(Scene scene) {
        if (scene == null) return null;
        
        SceneDTO dto = new SceneDTO();
        dto.setId(scene.getId());
        dto.setTitle(scene.getTitle());
        dto.setDescription(scene.getDescription());
        dto.setSequenceNumber(scene.getSequenceNumber());
        dto.setActId(scene.getAct().getId());
        
        return dto;
    }
    
    public Scene toEntity() {
        Scene scene = new Scene();
        scene.setId(this.id);
        scene.setTitle(this.title);
        scene.setDescription(this.description);
        scene.setSequenceNumber(this.sequenceNumber);
        
        return scene;
    }
}
