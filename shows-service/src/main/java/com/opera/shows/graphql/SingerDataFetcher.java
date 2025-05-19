package com.opera.shows.graphql;

import com.netflix.graphql.dgs.*;
import com.opera.shows.model.Singer;
import com.opera.shows.service.SingerService;
import com.opera.shows.service.dto.SingerDTO;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@DgsComponent
public class SingerDataFetcher {

    private final SingerService singerService;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;

    @Autowired
    public SingerDataFetcher(SingerService singerService) {
        this.singerService = singerService;
    }

    @DgsQuery
    public List<SingerDTO> singers() {
        return singerService.findAllSingersWithDetails();
    }

    @DgsQuery
    public SingerDTO singer(@InputArgument("id") String id) {
        return singerService.findSingerWithDetails(UUID.fromString(id));
    }

    @DgsQuery
    public List<SingerDTO> singersByOperaId(@InputArgument("operaId") String operaId) {
        return singerService.findSingersByOperaId(UUID.fromString(operaId)).stream()
                .map(singer -> singerService.findSingerWithDetails(singer.getId()))
                .collect(Collectors.toList());
    }

    @DgsQuery
    public List<SingerDTO> singersByVoiceType(@InputArgument("voiceType") String voiceTypeStr) {
        try {
            Singer.VoiceType voiceType = Singer.VoiceType.valueOf(voiceTypeStr);
            return singerService.findByVoiceType(voiceType).stream()
                    .map(singer -> singerService.findSingerWithDetails(singer.getId()))
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid voice type: " + voiceTypeStr);
        }
    }

    @DgsMutation
    public SingerDTO createSinger(@InputArgument("singerInput") SingerInput input) {
        SingerDTO dto = new SingerDTO();
        dto.setFirstName(input.getFirstName());
        dto.setLastName(input.getLastName());
        
        if (input.getDateOfBirth() != null) {
            dto.setDateOfBirth(LocalDate.parse(input.getDateOfBirth(), dateFormatter));
        }
        
        dto.setNationality(input.getNationality());
        dto.setBio(input.getBio());
        dto.setImageUrl(input.getImageUrl());
        dto.setVoiceType(Singer.VoiceType.valueOf(input.getVoiceType().name()));
        
        return singerService.createSinger(dto);
    }

    @DgsMutation
    public SingerDTO updateSinger(
            @InputArgument("id") String id,
            @InputArgument("singerInput") SingerInput input) {
        
        SingerDTO dto = new SingerDTO();
        dto.setId(UUID.fromString(id));
        dto.setFirstName(input.getFirstName());
        dto.setLastName(input.getLastName());
        
        if (input.getDateOfBirth() != null) {
            dto.setDateOfBirth(LocalDate.parse(input.getDateOfBirth(), dateFormatter));
        }
        
        dto.setNationality(input.getNationality());
        dto.setBio(input.getBio());
        dto.setImageUrl(input.getImageUrl());
        dto.setVoiceType(Singer.VoiceType.valueOf(input.getVoiceType().name()));
        
        return singerService.updateSinger(UUID.fromString(id), dto);
    }

    @DgsMutation
    public Boolean deleteSinger(@InputArgument("id") String id) {
        singerService.deleteById(UUID.fromString(id));
        return true;
    }

    @DgsData(parentType = "Show", field = "cast")
    public List<ShowSinger> castForShow(DgsDataFetchingEnvironment dfe) {
        String showId = dfe.getSource().getId();
        // This will be handled by the ShowService when loading the ShowDTO
        return null;
    }

    @DgsData(parentType = "Singer", field = "showAppearances")
    public List<ShowSinger> appearancesForSinger(DgsDataFetchingEnvironment dfe) {
        String singerId = dfe.getSource().getId();
        // This will be handled by the SingerService when loading the SingerDTO
        return null;
    }
}
