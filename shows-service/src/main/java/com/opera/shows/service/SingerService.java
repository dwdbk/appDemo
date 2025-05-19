package com.opera.shows.service;

import com.opera.shows.model.Singer;
import com.opera.shows.service.dto.SingerDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SingerService extends BaseService<Singer, UUID> {
    List<Singer> findByLastNameContaining(String lastName);
    List<Singer> findByNationality(String nationality);
    List<Singer> findByVoiceType(Singer.VoiceType voiceType);
    List<Singer> findBornBetween(LocalDate startDate, LocalDate endDate);
    List<Singer> findSingersByOperaId(UUID operaId);
    
    // DTO methods
    SingerDTO findSingerWithDetails(UUID id);
    List<SingerDTO> findAllSingersWithDetails();
    SingerDTO createSinger(SingerDTO singerDTO);
    SingerDTO updateSinger(UUID id, SingerDTO singerDTO);
}
