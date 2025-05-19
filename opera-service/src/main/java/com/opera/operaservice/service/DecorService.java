package com.opera.operaservice.service;

import com.opera.operaservice.model.Decor;

import java.util.List;
import java.util.UUID;

public interface DecorService extends BaseService<Decor, UUID> {
    List<Decor> findByOperaId(UUID operaId);
    List<Decor> findByNameContaining(String name);
}
