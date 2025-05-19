package com.opera.shows.service.dto;

import com.opera.shows.model.Singer;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class SingerDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String nationality;
    private String bio;
    private String imageUrl;
    private Singer.VoiceType voiceType;
    private Set<ShowSingerDTO> showAppearances = new HashSet<>();
    
    public static SingerDTO fromEntity(Singer singer) {
        if (singer == null) return null;
        
        SingerDTO dto = new SingerDTO();
        dto.setId(singer.getId());
        dto.setFirstName(singer.getFirstName());
        dto.setLastName(singer.getLastName());
        dto.setDateOfBirth(singer.getDateOfBirth());
        dto.setNationality(singer.getNationality());
        dto.setBio(singer.getBio());
        dto.setImageUrl(singer.getImageUrl());
        dto.setVoiceType(singer.getVoiceType());
        
        return dto;
    }
    
    public Singer toEntity() {
        Singer singer = new Singer();
        singer.setId(this.id);
        singer.setFirstName(this.firstName);
        singer.setLastName(this.lastName);
        singer.setDateOfBirth(this.dateOfBirth);
        singer.setNationality(this.nationality);
        singer.setBio(this.bio);
        singer.setImageUrl(this.imageUrl);
        singer.setVoiceType(this.voiceType);
        
        return singer;
    }
}
