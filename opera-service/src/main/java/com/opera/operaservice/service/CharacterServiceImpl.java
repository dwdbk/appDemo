package com.opera.operaservice.service;

import com.opera.operaservice.model.Character;
import com.opera.operaservice.repository.CharacterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CharacterServiceImpl extends BaseServiceImpl<Character, UUID, CharacterRepository> 
        implements CharacterService {

    private final CharacterRepository characterRepository;

    public CharacterServiceImpl(CharacterRepository repository) {
        super(repository);
        this.characterRepository = repository;
    }

    @Override
    public List<Character> findByOperaId(UUID operaId) {
        return characterRepository.findByOperaId(operaId);
    }

    @Override
    public List<Character> findByNameContaining(String name) {
        return characterRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public List<Character> findByVoiceType(Character.VoiceType voiceType) {
        return characterRepository.findByVoiceType(voiceType);
    }
}
