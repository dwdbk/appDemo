package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "acts")
@Getter
@Setter
public class Act extends BaseEntity {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private Integer actNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opera_id", nullable = false)
    private Opera opera;
    
    @OneToMany(mappedBy = "act", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Scene> scenes = new HashSet<>();
    
    public void addScene(Scene scene) {
        scenes.add(scene);
        scene.setAct(this);
    }
    
    public void removeScene(Scene scene) {
        scenes.remove(scene);
        scene.setAct(null);
    }
}
