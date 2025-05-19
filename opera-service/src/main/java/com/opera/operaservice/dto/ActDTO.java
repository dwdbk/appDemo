package com.opera.operaservice.dto;

import com.opera.operaservice.model.Act;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class ActDTO {
    private UUID id;
    private String title;
    private String description;
    private Integer sequenceNumber;
    private UUID operaId;
    private Set<SceneDTO> scenes = new HashSet<>();
    
    // For GraphQL federation
    private OperaDTO opera;
    
    public static ActDTO fromEntity(Act act) {
        if (act == null) return null;
        
        ActDTO dto = new ActDTO();
        dto.setId(act.getId());
        dto.setTitle(act.getTitle());
        dto.setDescription(act.getDescription());
        dto.setSequenceNumber(act.getSequenceNumber());
        dto.setOperaId(act.getOpera().getId());
        
        return dto;
    }
    
    public Act toEntity() {
        Act act = new Act();
        act.setId(this.id);
        act.setTitle(this.title);
        act.setDescription(this.description);
        act.setSequenceNumber(this.sequenceNumber);
        
        return act;
    }
}
