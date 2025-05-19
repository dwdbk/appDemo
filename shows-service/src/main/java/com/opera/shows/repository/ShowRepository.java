package com.opera.shows.repository;

import com.opera.shows.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShowRepository extends JpaRepository<Show, UUID> {
    List<Show> findByOperaId(UUID operaId);
    List<Show> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Show> findByStatus(Show.ShowStatus status);
    
    @Query("SELECT s FROM Show s WHERE s.startTime >= :now AND s.status = 'SCHEDULED' ORDER BY s.startTime ASC")
    List<Show> findUpcomingShows(@Param("now") LocalDateTime now);
    
    @Query("SELECT s FROM Show s WHERE s.venue = :venue AND s.startTime >= :start AND s.startTime < :end")
    List<Show> findByVenueAndDateRange(
        @Param("venue") String venue, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
}
