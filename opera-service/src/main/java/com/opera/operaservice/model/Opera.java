package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Year;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "operas")
@Getter
@Setter
public class Opera extends BaseEntity {
    @NotBlank
    private String title;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    private Year premiereYear;
    
    private String composer;
    private String librettist;
    private String language;
    
    @OneToMany(mappedBy = "opera", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Act> acts = new HashSet<>();
    
    @OneToMany(mappedBy = "opera", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Character> characters = new HashSet<>();
    
    public void addAct(Act act) {
        acts.add(act);
        act.setOpera(this);
    }
    
    public void removeAct(Act act) {
        acts.remove(act);
        act.setOpera(null);
    }
    
    public void addCharacter(Character character) {
        characters.add(character);
        character.setOpera(this);
    }
    
    public void removeCharacter(Character character) {
        characters.remove(character);
        character.setOpera(null);
    }
}
