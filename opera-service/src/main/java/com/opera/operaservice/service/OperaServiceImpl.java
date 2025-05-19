package com.opera.operaservice.service;

import com.opera.operaservice.model.Opera;
import com.opera.operaservice.repository.OperaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OperaServiceImpl extends BaseServiceImpl<Opera, UUID, OperaRepository> 
        implements OperaService {

    public OperaServiceImpl(OperaRepository repository) {
        super(repository);
    }

    @Override
    public List<Opera> findByTitleContaining(String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<Opera> findByComposer(String composer) {
        return repository.findByComposerContainingIgnoreCase(composer);
    }

    @Override
    public List<Opera> findByPremiereYearBetween(Integer startYear, Integer endYear) {
        Year start = Year.of(startYear);
        Year end = Year.of(endYear);
        return repository.findByPremiereYearBetween(start, end);
    }
}
