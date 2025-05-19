package com.opera.shows.util;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class ModelMapperUtils {

    private static ModelMapper modelMapper;

    private final ModelMapper nonStaticModelMapper;

    @Autowired
    public ModelMapperUtils(ModelMapper modelMapper) {
        this.nonStaticModelMapper = modelMapper;
    }

    @PostConstruct
    public void init() {
        modelMapper = nonStaticModelMapper;
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true);
    }

    public static <D> D map(Object source, Class<D> destinationType) {
        if (source == null) {
            return null;
        }
        return modelMapper.map(source, destinationType);
    }

    public static void map(Object source, Object destination) {
        if (source == null || destination == null) {
            return;
        }
        modelMapper.map(source, destination);
    }
}
