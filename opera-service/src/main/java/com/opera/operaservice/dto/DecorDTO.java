package com.opera.operaservice.dto;

import com.opera.operaservice.model.Decor;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class DecorDTO {
    private UUID id;
    private String name;
    private String description;
    private UUID operaId;
    private Set<SceneDTO> scenes = new HashSet<>();
    
    // For GraphQL federation
    private OperaDTO opera;
    
    public static DecorDTO fromEntity(Decor decor) {
        if (decor == null) return null;
        
        DecorDTO dto = new DecorDTO();
        dto.setId(decor.getId());
        dto.setName(decor.getName());
        dto.setDescription(decor.getDescription());
        dto.setOperaId(decor.getOpera().getId());
        
        return dto;
    }
    
    public Decor toEntity() {
        Decor decor = new Decor();
        decor.setId(this.id);
        decor.setName(this.name);
        decor.setDescription(this.description);
        
        return decor;
    }
}
