package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "scenes")
@Getter
@Setter
public class Scene extends BaseEntity {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private Integer sceneNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "act_id", nullable = false)
    private Act act;
    
    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Music> musicalPieces = new HashSet<>();
    
    @ManyToMany
    @JoinTable(
        name = "scene_characters",
        joinColumns = @JoinColumn(name = "scene_id"),
        inverseJoinColumns = @JoinColumn(name = "character_id")
    )
    private Set<Character> characters = new HashSet<>();
    
    @ManyToMany
    @JoinTable(
        name = "scene_decors",
        joinColumns = @JoinColumn(name = "scene_id"),
        inverseJoinColumns = @JoinColumn(name = "decor_id")
    )
    private Set<Decor> decors = new HashSet<>();
    
    public void addMusic(Music music) {
        musicalPieces.add(music);
        music.setScene(this);
    }
    
    public void removeMusic(Music music) {
        musicalPieces.remove(music);
        music.setScene(null);
    }
    
    public void addCharacter(Character character) {
        characters.add(character);
    }
    
    public void removeCharacter(Character character) {
        characters.remove(character);
    }
    
    public void addDecor(Decor decor) {
        decors.add(decor);
    }
    
    public void removeDecor(Decor decor) {
        decors.remove(decor);
    }
}
