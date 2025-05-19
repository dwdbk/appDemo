package com.opera.operaservice.graphql.input;

import com.opera.operaservice.model.Character;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CharacterInput {
    private String name;
    private String description;
    private Character.VoiceType voiceType;
    private UUID operaId;
    private List<UUID> sceneIds;
    private List<UUID> musicIds;
}
