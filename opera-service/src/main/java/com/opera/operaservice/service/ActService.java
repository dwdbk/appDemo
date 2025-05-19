package com.opera.operaservice.service;

import com.opera.operaservice.model.Act;

import java.util.List;
import java.util.UUID;

public interface ActService extends BaseService<Act, UUID> {
    List<Act> findByOperaId(UUID operaId);
    List<Act> findByTitleContaining(String title);
}
