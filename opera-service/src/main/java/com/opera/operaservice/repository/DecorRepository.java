package com.opera.operaservice.repository;

import com.opera.operaservice.model.Decor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecorRepository extends JpaRepository<Decor, UUID> {
    List<Decor> findByOperaId(UUID operaId);
    List<Decor> findByNameContainingIgnoreCase(String name);
}
