package com.opera.shows.repository;

import com.opera.shows.model.Singer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SingerRepository extends JpaRepository<Singer, UUID> {
    List<Singer> findByLastNameContainingIgnoreCase(String lastName);
    List<Singer> findByNationality(String nationality);
    List<Singer> findByVoiceType(Singer.VoiceType voiceType);
    
    @Query("SELECT s FROM Singer s WHERE s.dateOfBirth BETWEEN :startDate AND :endDate")
    List<Singer> findBornBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT DISTINCT s FROM Singer s " +
           "JOIN s.showAppearances sa " +
           "JOIN sa.show sh " +
           "WHERE sh.operaId = :operaId")
    List<Singer> findSingersByOperaId(@Param("operaId") UUID operaId);
}
