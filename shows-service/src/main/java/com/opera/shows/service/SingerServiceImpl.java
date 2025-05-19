package com.opera.shows.service;

import com.opera.shows.model.Singer;
import com.opera.shows.model.ShowSinger;
import com.opera.shows.repository.SingerRepository;
import com.opera.shows.repository.ShowSingerRepository;
import com.opera.shows.service.dto.SingerDTO;
import com.opera.shows.service.dto.ShowSingerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SingerServiceImpl extends BaseServiceImpl<Singer, UUID, SingerRepository> 
        implements SingerService {

    private final SingerRepository singerRepository;
    private final ShowSingerRepository showSingerRepository;

    @Autowired
    public SingerServiceImpl(SingerRepository repository, ShowSingerRepository showSingerRepository) {
        super(repository);
        this.singerRepository = repository;
        this.showSingerRepository = showSingerRepository;
    }

    @Override
    public List<Singer> findByLastNameContaining(String lastName) {
        return singerRepository.findByLastNameContainingIgnoreCase(lastName);
    }

    @Override
    public List<Singer> findByNationality(String nationality) {
        return singerRepository.findByNationality(nationality);
    }

    @Override
    public List<Singer> findByVoiceType(Singer.VoiceType voiceType) {
        return singerRepository.findByVoiceType(voiceType);
    }

    @Override
    public List<Singer> findBornBetween(LocalDate startDate, LocalDate endDate) {
        return singerRepository.findBornBetween(startDate, endDate);
    }

    @Override
    public List<Singer> findSingersByOperaId(UUID operaId) {
        return singerRepository.findSingersByOperaId(operaId);
    }

    @Override
    public SingerDTO findSingerWithDetails(UUID id) {
        return singerRepository.findById(id)
                .map(this::convertToSingerDTO)
                .orElse(null);
    }

    @Override
    public List<SingerDTO> findAllSingersWithDetails() {
        return singerRepository.findAll().stream()
                .map(this::convertToSingerDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SingerDTO createSinger(SingerDTO singerDTO) {
        Singer singer = singerDTO.toEntity();
        Singer savedSinger = singerRepository.save(singer);
        return convertToSingerDTO(savedSinger);
    }

    @Override
    public SingerDTO updateSinger(UUID id, SingerDTO singerDTO) {
        return singerRepository.findById(id)
                .map(existingSinger -> {
                    Singer updatedSinger = singerDTO.toEntity();
                    updatedSinger.setId(id);
                    updatedSinger.setCreatedAt(existingSinger.getCreatedAt());
                    updatedSinger.setVersion(existingSinger.getVersion());
                    Singer savedSinger = singerRepository.save(updatedSinger);
                    return convertToSingerDTO(savedSinger);
                })
                .orElse(null);
    }

    private SingerDTO convertToSingerDTO(Singer singer) {
        if (singer == null) return null;
        
        SingerDTO dto = SingerDTO.fromEntity(singer);
        
        // Load and set show appearances
        List<ShowSinger> appearances = showSingerRepository.findWithShowBySingerId(singer.getId());
        Set<ShowSingerDTO> appearanceDTOs = appearances.stream()
                .map(appearance -> {
                    ShowSingerDTO appDto = new ShowSingerDTO();
                    appDto.setId(appearance.getId());
                    appDto.setShowId(appearance.getShow().getId());
                    appDto.setSingerId(appearance.getSinger().getId());
                    appDto.setCharacterName(appearance.getCharacterName());
                    appDto.setRole(appearance.getRole());
                    return appDto;
                })
                .collect(Collectors.toSet());
        
        dto.setShowAppearances(appearanceDTOs);
        return dto;
    }
}
