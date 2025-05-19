package com.opera.shows.repository;

import com.opera.shows.model.ShowSinger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShowSingerRepository extends JpaRepository<ShowSinger, UUID> {
    List<ShowSinger> findByShowId(UUID showId);
    List<ShowSinger> findBySingerId(UUID singerId);
    
    @Query("SELECT ss FROM ShowSinger ss WHERE ss.show.id = :showId AND ss.singer.id = :singerId")
    ShowSinger findByShowIdAndSingerId(
        @Param("showId") UUID showId,
        @Param("singerId") UUID singerId
    );
    
    @Query("SELECT ss FROM ShowSinger ss JOIN FETCH ss.singer WHERE ss.show.id = :showId")
    List<ShowSinger> findWithSingerByShowId(@Param("showId") UUID showId);
    
    @Query("SELECT ss FROM ShowSinger ss JOIN FETCH ss.show WHERE ss.singer.id = :singerId")
    List<ShowSinger> findWithShowBySingerId(@Param("singerId") UUID singerId);
}
