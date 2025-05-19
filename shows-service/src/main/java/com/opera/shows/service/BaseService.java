package com.opera.shows.service;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

public interface BaseService<T, ID extends Serializable> {
    List<T> findAll();
    Optional<T> findById(ID id);
    T save(T entity);
    T update(ID id, T entity);
    void deleteById(ID id);
}
