package com.opera.operaservice.service;

import com.opera.operaservice.model.Scene;

import java.util.List;
import java.util.UUID;

public interface SceneService extends BaseService<Scene, UUID> {
    List<Scene> findByActId(UUID actId);
    List<Scene> findByTitleContaining(String title);
}
