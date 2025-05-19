package com.opera.operaservice.service;

import com.opera.operaservice.model.Opera;

import java.util.List;
import java.util.UUID;

public interface OperaService extends BaseService<Opera, UUID> {
    List<Opera> findByTitleContaining(String title);
    List<Opera> findByComposer(String composer);
    List<Opera> findByPremiereYearBetween(Integer startYear, Integer endYear);
}
