package com.opera.shows.client;

import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class FeignErrorDecoder implements ErrorDecoder {
    
    private final ErrorDecoder defaultErrorDecoder = new Default();
    
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 404) {
            return new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Opera not found with id: " + extractIdFromUrl(response.request().url())
            );
        }
        
        if (response.status() >= 400 && response.status() <= 499) {
            return new ResponseStatusException(
                    HttpStatus.valueOf(response.status()),
                    "Client error occurred while calling Opera Service"
            );
        }
        
        if (response.status() >= 500) {
            return new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error occurred while calling Opera Service"
            );
        }
        
        return defaultErrorDecoder.decode(methodKey, response);
    }
    
    private String extractIdFromUrl(String url) {
        String[] parts = url.split("/");
        return parts[parts.length - 1];
    }
}
