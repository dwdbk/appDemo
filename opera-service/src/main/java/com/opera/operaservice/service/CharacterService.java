package com.opera.operaservice.service;

import com.opera.operaservice.model.Character;

import java.util.List;
import java.util.UUID;

public interface CharacterService extends BaseService<Character, UUID> {
    List<Character> findByOperaId(UUID operaId);
    List<Character> findByNameContaining(String name);
    List<Character> findByVoiceType(Character.VoiceType voiceType);
}
