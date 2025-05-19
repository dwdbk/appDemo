package com.opera.operaservice.repository;

import com.opera.operaservice.model.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SceneRepository extends JpaRepository<Scene, UUID> {
    List<Scene> findByActId(UUID actId);
    List<Scene> findByTitleContainingIgnoreCase(String title);
}
