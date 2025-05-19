package com.opera.operaservice.repository;

import com.opera.operaservice.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CharacterRepository extends JpaRepository<Character, UUID> {
    List<Character> findByOperaId(UUID operaId);
    List<Character> findByNameContainingIgnoreCase(String name);
    List<Character> findByVoiceType(Character.VoiceType voiceType);
}
