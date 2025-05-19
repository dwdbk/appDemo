package com.opera.shows.graphql;

import com.netflix.graphql.dgs.*;
import com.opera.shows.model.Show;
import com.opera.shows.service.ShowService;
import com.opera.shows.service.dto.ShowDTO;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@DgsComponent
public class ShowDataFetcher {

    private final ShowService showService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    @Autowired
    public ShowDataFetcher(ShowService showService) {
        this.showService = showService;
    }

    @DgsQuery
    public List<ShowDTO> shows() {
        return showService.findAllShowsWithDetails();
    }

    @DgsQuery
    public ShowDTO show(@InputArgument("id") String id) {
        return showService.findShowWithDetails(UUID.fromString(id));
    }

    @DgsQuery
    public List<ShowDTO> showsByOperaId(@InputArgument("operaId") String operaId) {
        return showService.findByOperaId(UUID.fromString(operaId)).stream()
                .map(show -> showService.findShowWithDetails(show.getId()))
                .collect(Collectors.toList());
    }

    @DgsQuery
    public List<ShowDTO> upcomingShows(@InputArgument("now") String now) {
        LocalDateTime dateTime = LocalDateTime.parse(now, formatter);
        return showService.findUpcomingShows(dateTime).stream()
                .map(show -> showService.findShowWithDetails(show.getId()))
                .collect(Collectors.toList());
    }

    @DgsQuery
    public List<ShowDTO> showsByVenueAndDateRange(
            @InputArgument("venue") String venue,
            @InputArgument("start") String start,
            @InputArgument("end") String end) {
        
        LocalDateTime startTime = LocalDateTime.parse(start, formatter);
        LocalDateTime endTime = LocalDateTime.parse(end, formatter);
        
        return showService.findByVenueAndDateRange(venue, startTime, endTime).stream()
                .map(show -> showService.findShowWithDetails(show.getId()))
                .collect(Collectors.toList());
    }

    @DgsMutation
    public ShowDTO createShow(@InputArgument("showInput") ShowInput input) {
        ShowDTO dto = new ShowDTO();
        dto.setOperaId(UUID.fromString(input.getOperaId()));
        dto.setStartTime(LocalDateTime.parse(input.getStartTime(), formatter));
        dto.setEndTime(LocalDateTime.parse(input.getEndTime(), formatter));
        dto.setVenue(input.getVenue());
        dto.setDescription(input.getDescription());
        dto.setImageUrl(input.getImageUrl());
        dto.setStatus(Show.ShowStatus.valueOf(input.getStatus().name()));
        
        return showService.createShow(dto);
    }

    @DgsMutation
    public ShowDTO updateShow(
            @InputArgument("id") String id,
            @InputArgument("showInput") ShowInput input) {
        
        ShowDTO dto = new ShowDTO();
        dto.setId(UUID.fromString(id));
        dto.setOperaId(UUID.fromString(input.getOperaId()));
        dto.setStartTime(LocalDateTime.parse(input.getStartTime(), formatter));
        dto.setEndTime(LocalDateTime.parse(input.getEndTime(), formatter));
        dto.setVenue(input.getVenue());
        dto.setDescription(input.getDescription());
        dto.setImageUrl(input.getImageUrl());
        dto.setStatus(Show.ShowStatus.valueOf(input.getStatus().name()));
        
        return showService.updateShow(UUID.fromString(id), dto);
    }

    @DgsMutation
    public Boolean deleteShow(@InputArgument("id") String id) {
        showService.deleteById(UUID.fromString(id));
        return true;
    }

    @DgsMutation
    public ShowDTO addCastMember(
            @InputArgument("showId") String showId,
            @InputArgument("singerId") String singerId,
            @InputArgument("characterName") String characterName,
            @InputArgument("role") String role) {
        
        return showService.addCastMember(
                UUID.fromString(showId),
                UUID.fromString(singerId),
                characterName,
                role
        );
    }

    @DgsMutation
    public ShowDTO updateCastMember(
            @InputArgument("showSingerId") String showSingerId,
            @InputArgument("characterName") String characterName,
            @InputArgument("role") String role) {
        
        return showService.updateCastMember(
                UUID.fromString(showSingerId),
                characterName,
                role
        );
    }

    @DgsMutation
    public ShowDTO removeCastMember(
            @InputArgument("showId") String showId,
            @InputArgument("singerId") String singerId) {
        
        return showService.removeCastMember(
                UUID.fromString(showId),
                UUID.fromString(singerId)
        );
    }

    @DgsData(parentType = "Opera", field = "shows")
    public List<ShowDTO> showsForOpera(DgsDataFetchingEnvironment dfe) {
        String operaId = dfe.getSource().getId();
        return showService.findByOperaId(UUID.fromString(operaId)).stream()
                .map(show -> showService.findShowWithDetails(show.getId()))
                .collect(Collectors.toList());
    }
}
