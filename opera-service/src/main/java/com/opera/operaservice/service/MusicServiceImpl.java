package com.opera.operaservice.service;

import com.opera.operaservice.model.Music;
import com.opera.operaservice.repository.MusicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MusicServiceImpl extends BaseServiceImpl<Music, UUID, MusicRepository> 
        implements MusicService {

    private final MusicRepository musicRepository;

    public MusicServiceImpl(MusicRepository repository) {
        super(repository);
        this.musicRepository = repository;
    }

    @Override
    public List<Music> findBySceneId(UUID sceneId) {
        return musicRepository.findBySceneId(sceneId);
    }

    @Override
    public List<Music> findByTitleContaining(String title) {
        return musicRepository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<Music> findByComposer(String composer) {
        return musicRepository.findByComposerContainingIgnoreCase(composer);
    }
}
