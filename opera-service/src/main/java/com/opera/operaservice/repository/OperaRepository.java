package com.opera.operaservice.repository;

import com.opera.operaservice.model.Opera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Repository
public interface OperaRepository extends JpaRepository<Opera, UUID> {
    List<Opera> findByTitleContainingIgnoreCase(String title);
    List<Opera> findByComposerContainingIgnoreCase(String composer);
    List<Opera> findByPremiereYearBetween(Year start, Year end);
}
