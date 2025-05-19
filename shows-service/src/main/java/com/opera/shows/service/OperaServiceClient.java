package com.opera.shows.service;

import com.opera.shows.model.Opera;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Client for communicating with the Opera Service.
 * This would be replaced with a proper GraphQL client in a real implementation.
 */
@Component
public class OperaServiceClient {

    private final RestTemplate restTemplate;
    private final String operaServiceBaseUrl;

    public OperaServiceClient(
            RestTemplate restTemplate,
            @Value("${opera.service.url:http://localhost:8081}") String operaServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.operaServiceBaseUrl = operaServiceBaseUrl;
    }

    /**
     * Fetches an opera by ID from the Opera Service.
     * In a real implementation, this would be a GraphQL query.
     */
    public Opera getOperaById(String id) {
        String url = UriComponentsBuilder.fromHttpUrl(operaServiceBaseUrl)
                .path("/api/operas/{id}")
                .buildAndExpand(id)
                .toUriString();
        
        try {
            ResponseEntity<Opera> response = restTemplate.getForEntity(url, Opera.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
            return null;
        } catch (Exception e) {
            // Log error and return null (or handle differently as needed)
            System.err.println("Error fetching opera with ID " + id + ": " + e.getMessage());
            return null;
        }
    }
}
