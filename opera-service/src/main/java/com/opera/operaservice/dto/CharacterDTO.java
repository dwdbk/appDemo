package com.opera.operaservice.dto;

import com.opera.operaservice.model.Character;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class CharacterDTO {
    private UUID id;
    private String name;
    private String description;
    private Character.VoiceType voiceType;
    private UUID operaId;
    private Set<SceneDTO> scenes = new HashSet<>();
    private Set<MusicDTO> music = new HashSet<>();
    
    // For GraphQL federation
    private OperaDTO opera;
    private Set<ShowSingerDTO> showAppearances = new HashSet<>();
    
    public static CharacterDTO fromEntity(Character character) {
        if (character == null) return null;
        
        CharacterDTO dto = new CharacterDTO();
        dto.setId(character.getId());
        dto.setName(character.getName());
        dto.setDescription(character.getDescription());
        dto.setVoiceType(character.getVoiceType());
        dto.setOperaId(character.getOpera().getId());
        
        return dto;
    }
    
    public Character toEntity() {
        Character character = new Character();
        character.setId(this.id);
        character.setName(this.name);
        character.setDescription(this.description);
        character.setVoiceType(this.voiceType);
        
        return character;
    }
}
