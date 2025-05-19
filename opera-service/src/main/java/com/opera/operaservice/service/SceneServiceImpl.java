package com.opera.operaservice.service;

import com.opera.operaservice.model.Scene;
import com.opera.operaservice.repository.SceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SceneServiceImpl extends BaseServiceImpl<Scene, UUID, SceneRepository> 
        implements SceneService {

    private final SceneRepository sceneRepository;

    public SceneServiceImpl(SceneRepository repository) {
        super(repository);
        this.sceneRepository = repository;
    }

    @Override
    public List<Scene> findByActId(UUID actId) {
        return sceneRepository.findByActId(actId);
    }

    @Override
    public List<Scene> findByTitleContaining(String title) {
        return sceneRepository.findByTitleContainingIgnoreCase(title);
    }
}
