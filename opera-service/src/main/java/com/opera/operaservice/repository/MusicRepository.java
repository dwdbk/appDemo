package com.opera.operaservice.repository;

import com.opera.operaservice.model.Music;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MusicRepository extends JpaRepository<Music, UUID> {
    List<Music> findBySceneId(UUID sceneId);
    List<Music> findByTitleContainingIgnoreCase(String title);
    List<Music> findByComposerContainingIgnoreCase(String composer);
}
