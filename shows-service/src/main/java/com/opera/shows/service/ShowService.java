package com.opera.shows.service;

import com.opera.shows.model.Show;
import com.opera.shows.service.dto.ShowDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ShowService extends BaseService<Show, UUID> {
    List<Show> findByOperaId(UUID operaId);
    List<Show> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Show> findByStatus(Show.ShowStatus status);
    List<Show> findUpcomingShows(LocalDateTime now);
    List<Show> findByVenueAndDateRange(String venue, LocalDateTime start, LocalDateTime end);
    
    // DTO methods
    ShowDTO findShowWithDetails(UUID id);
    List<ShowDTO> findAllShowsWithDetails();
    ShowDTO createShow(ShowDTO showDTO);
    ShowDTO updateShow(UUID id, ShowDTO showDTO);
    
    // Cast management
    ShowDTO addCastMember(UUID showId, UUID singerId, String characterName, String role);
    ShowDTO removeCastMember(UUID showId, UUID singerId);
    ShowDTO updateCastMember(UUID showSingerId, String characterName, String role);
}
