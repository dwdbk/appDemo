package com.opera.operaservice.service;

import com.opera.operaservice.model.Decor;
import com.opera.operaservice.repository.DecorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DecorServiceImpl extends BaseServiceImpl<Decor, UUID, DecorRepository> 
        implements DecorService {

    private final DecorRepository decorRepository;

    public DecorServiceImpl(DecorRepository repository) {
        super(repository);
        this.decorRepository = repository;
    }

    @Override
    public List<Decor> findByOperaId(UUID operaId) {
        return decorRepository.findByOperaId(operaId);
    }

    @Override
    public List<Decor> findByNameContaining(String name) {
        return decorRepository.findByNameContainingIgnoreCase(name);
    }
}
