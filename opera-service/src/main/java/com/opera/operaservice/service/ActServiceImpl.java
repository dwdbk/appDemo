package com.opera.operaservice.service;

import com.opera.operaservice.model.Act;
import com.opera.operaservice.repository.ActRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ActServiceImpl extends BaseServiceImpl<Act, UUID, ActRepository> 
        implements ActService {

    private final ActRepository actRepository;

    public ActServiceImpl(ActRepository repository) {
        super(repository);
        this.actRepository = repository;
    }

    @Override
    public List<Act> findByOperaId(UUID operaId) {
        return actRepository.findByOperaId(operaId);
    }

    @Override
    public List<Act> findByTitleContaining(String title) {
        return actRepository.findByTitleContainingIgnoreCase(title);
    }
}
