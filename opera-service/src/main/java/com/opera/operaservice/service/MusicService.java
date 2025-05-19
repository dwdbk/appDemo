package com.opera.operaservice.service;

import com.opera.operaservice.model.Music;

import java.util.List;
import java.util.UUID;

public interface MusicService extends BaseService<Music, UUID> {
    List<Music> findBySceneId(UUID sceneId);
    List<Music> findByTitleContaining(String title);
    List<Music> findByComposer(String composer);
}
