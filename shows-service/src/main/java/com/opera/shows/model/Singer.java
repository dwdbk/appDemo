package com.opera.shows.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "singers")
@Getter
@Setter
public class Singer extends BaseEntity {
    
    public enum VoiceType {
        SOPRANO, MEZZO_SOPRANO, CONTRALTO,
        COUNTERTENOR, TENOR, BARITONE, BASS,
        DRAMATIC_SOPRANO, COLORATURA_SOPRANO,
        HELDENTENOR, BASS_BARITONE
    }

    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
    
    private LocalDate dateOfBirth;
    private String nationality;
    private String bio;
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    private VoiceType voiceType;
    
    @OneToMany(mappedBy = "singer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ShowSinger> showAppearances = new HashSet<>();
    
    public String getFullName() {
        return String.format("%s %s", firstName, lastName);
    }
}
