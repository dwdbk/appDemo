package com.opera.operaservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "decors")
@Getter
@Setter
public class Decor extends BaseEntity {
    @NotBlank
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String imageUrl;
    
    @ManyToMany(mappedBy = "decors")
    private Set<Scene> scenes = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opera_id", nullable = false)
    private Opera opera;
}
