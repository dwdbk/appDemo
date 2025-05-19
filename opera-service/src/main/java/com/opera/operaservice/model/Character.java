package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "characters")
@Getter
@Setter
public class Character extends BaseEntity {
    @NotBlank
    private String name;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private VoiceType voiceType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opera_id", nullable = false)
    private Opera opera;
    
    @ManyToMany(mappedBy = "characters")
    private Set<Scene> scenes = new HashSet<>();
    
    @ManyToMany(mappedBy = "characters")
    private Set<Music> musicalPieces = new HashSet<>();
    
    public enum VoiceType {
        SOPRANO, MEZZO_SOPRANO, CONTRALTO,
        COUNTERTENOR, TENOR, BARITONE, BASS,
        DRAMATIC_SOPRANO, COLORATURA_SOPRANO,
        HELDENTENOR, BASS_BARITONE
    }
}
