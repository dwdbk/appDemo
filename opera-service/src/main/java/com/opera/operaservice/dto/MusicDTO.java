package com.opera.operaservice.dto;

import com.opera.operaservice.model.Music;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class MusicDTO {
    private UUID id;
    private String title;
    private String description;
    private String lyrics;
    private String composer;
    private UUID sceneId;
    private Set<CharacterDTO> characters = new HashSet<>();
    
    // For GraphQL federation
    private SceneDTO scene;
    
    public static MusicDTO fromEntity(Music music) {
        if (music == null) return null;
        
        MusicDTO dto = new MusicDTO();
        dto.setId(music.getId());
        dto.setTitle(music.getTitle());
        dto.setDescription(music.getDescription());
        dto.setLyrics(music.getLyrics());
        dto.setComposer(music.getComposer());
        dto.setSceneId(music.getScene().getId());
        
        return dto;
    }
    
    public Music toEntity() {
        Music music = new Music();
        music.setId(this.id);
        music.setTitle(this.title);
        music.setDescription(this.description);
        music.setLyrics(this.lyrics);
        music.setComposer(this.composer);
        
        return music;
    }
}
