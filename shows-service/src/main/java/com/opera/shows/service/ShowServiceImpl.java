package com.opera.shows.service;

import com.opera.shows.model.*;
import com.opera.shows.repository.ShowRepository;
import com.opera.shows.repository.ShowSingerRepository;
import com.opera.shows.repository.SingerRepository;
import com.opera.shows.service.dto.ShowDTO;
import com.opera.shows.service.dto.ShowSingerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShowServiceImpl extends BaseServiceImpl<Show, UUID, ShowRepository> 
        implements ShowService {

    private final ShowRepository showRepository;
    private final SingerRepository singerRepository;
    private final ShowSingerRepository showSingerRepository;
    private final OperaServiceClient operaServiceClient;

    @Autowired
    public ShowServiceImpl(ShowRepository repository, 
                          SingerRepository singerRepository,
                          ShowSingerRepository showSingerRepository,
                          OperaServiceClient operaServiceClient) {
        super(repository);
        this.showRepository = repository;
        this.singerRepository = singerRepository;
        this.showSingerRepository = showSingerRepository;
        this.operaServiceClient = operaServiceClient;
    }

    @Override
    public List<Show> findByOperaId(UUID operaId) {
        return showRepository.findByOperaId(operaId);
    }

    @Override
    public List<Show> findByStartTimeBetween(LocalDateTime start, LocalDateTime end) {
        return showRepository.findByStartTimeBetween(start, end);
    }

    @Override
    public List<Show> findByStatus(Show.ShowStatus status) {
        return showRepository.findByStatus(status);
    }

    @Override
    public List<Show> findUpcomingShows(LocalDateTime now) {
        return showRepository.findUpcomingShows(now);
    }

    @Override
    public List<Show> findByVenueAndDateRange(String venue, LocalDateTime start, LocalDateTime end) {
        return showRepository.findByVenueAndDateRange(venue, start, end);
    }

    @Override
    public ShowDTO findShowWithDetails(UUID id) {
        return showRepository.findById(id)
                .map(this::convertToShowDTO)
                .orElse(null);
    }

    @Override
    public List<ShowDTO> findAllShowsWithDetails() {
        return showRepository.findAll().stream()
                .map(this::convertToShowDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ShowDTO createShow(ShowDTO showDTO) {
        Show show = showDTO.toEntity();
        Show savedShow = showRepository.save(show);
        return convertToShowDTO(savedShow);
    }

    @Override
    public ShowDTO updateShow(UUID id, ShowDTO showDTO) {
        return showRepository.findById(id)
                .map(existingShow -> {
                    Show updatedShow = showDTO.toEntity();
                    updatedShow.setId(id);
                    updatedShow.setCreatedAt(existingShow.getCreatedAt());
                    updatedShow.setVersion(existingShow.getVersion());
                    
                    // Preserve the cast
                    updatedShow.setCast(existingShow.getCast());
                    
                    Show savedShow = showRepository.save(updatedShow);
                    return convertToShowDTO(savedShow);
                })
                .orElse(null);
    }

    @Override
    public ShowDTO addCastMember(UUID showId, UUID singerId, String characterName, String role) {
        return showRepository.findById(showId)
                .flatMap(show -> singerRepository.findById(singerId)
                        .map(singer -> {
                            ShowSinger showSinger = new ShowSinger();
                            showSinger.setShow(show);
                            showSinger.setSinger(singer);
                            showSinger.setCharacterName(characterName);
                            showSinger.setRole(role);
                            
                            show.getCast().add(showSinger);
                            Show updatedShow = showRepository.save(show);
                            return convertToShowDTO(updatedShow);
                        }))
                .orElse(null);
    }

    @Override
    public ShowDTO removeCastMember(UUID showId, UUID singerId) {
        return showRepository.findById(showId)
                .map(show -> {
                    Optional<ShowSinger> showSingerOpt = show.getCast().stream()
                            .filter(cs -> cs.getSinger().getId().equals(singerId))
                            .findFirst();
                            
                    showSingerOpt.ifPresent(showSinger -> {
                        show.getCast().remove(showSinger);
                        showSingerRepository.delete(showSinger);
                    });
                    
                    return convertToShowDTO(showRepository.save(show));
                })
                .orElse(null);
    }

    @Override
    public ShowDTO updateCastMember(UUID showSingerId, String characterName, String role) {
        return showSingerRepository.findById(showSingerId)
                .map(showSinger -> {
                    showSinger.setCharacterName(characterName);
                    showSinger.setRole(role);
                    ShowSinger updatedShowSinger = showSingerRepository.save(showSinger);
                    return convertToShowDTO(updatedShowSinger.getShow());
                })
                .orElse(null);
    }

    private ShowDTO convertToShowDTO(Show show) {
        if (show == null) return null;
        
        ShowDTO dto = ShowDTO.fromEntity(show);
        
        // Fetch opera details from Opera Service
        try {
            Opera opera = operaServiceClient.getOperaById(show.getOperaId().toString());
            if (opera != null) {
                dto.setOpera(OperaDTO.fromOpera(opera));
            }
        } catch (Exception e) {
            // Log error but don't fail the request
            // In a production environment, you might want to use a proper logger
            System.err.println("Error fetching opera details: " + e.getMessage());
        }
        
        // Load and set cast members
        List<ShowSinger> cast = showSingerRepository.findWithSingerByShowId(show.getId());
        dto.setCast(cast.stream()
                .map(cs -> {
                    ShowSingerDTO csDto = new ShowSingerDTO();
                    csDto.setId(cs.getId());
                    csDto.setShowId(cs.getShow().getId());
                    csDto.setSingerId(cs.getSinger().getId());
                    csDto.setCharacterName(cs.getCharacterName());
                    csDto.setRole(cs.getRole());
                    csDto.setSinger(SingerDTO.fromEntity(cs.getSinger()));
                    return csDto;
                })
                .collect(Collectors.toSet()));
        
        return dto;
    }
}
