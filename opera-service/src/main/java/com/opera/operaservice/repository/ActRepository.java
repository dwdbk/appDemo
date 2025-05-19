package com.opera.operaservice.repository;

import com.opera.operaservice.model.Act;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActRepository extends JpaRepository<Act, UUID> {
    List<Act> findByOperaId(UUID operaId);
    List<Act> findByTitleContainingIgnoreCase(String title);
}
