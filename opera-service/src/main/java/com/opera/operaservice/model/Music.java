package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "music")
@Getter
@Setter
public class Music extends BaseEntity {
    @NotBlank
    private String title;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String lyrics;
    
    private String composer;
    private String keySignature;
    private String timeSignature;
    private Integer tempoBpm;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;
    
    @ManyToMany
    @JoinTable(
        name = "music_characters",
        joinColumns = @JoinColumn(name = "music_id"),
        inverseJoinColumns = @JoinColumn(name = "character_id")
    )
    private Set<Character> characters = new HashSet<>();
    
    public void addCharacter(Character character) {
        characters.add(character);
    }
    
    public void removeCharacter(Character character) {
        characters.remove(character);
    }
}
