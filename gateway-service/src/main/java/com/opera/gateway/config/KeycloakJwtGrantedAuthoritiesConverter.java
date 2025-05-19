package com.opera.gateway.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class KeycloakJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String ROLES_CLAIM = "roles";
    private static final String RESOURCE_ACCESS_CLAIM = "resource_access";
    private static final String CLIENT_ID = "opera-gateway";

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim(RESOURCE_ACCESS_CLAIM);
        
        if (resourceAccess == null || resourceAccess.isEmpty()) {
            return Collections.emptyList();
        }

        // Get client roles
        @SuppressWarnings("unchecked")
        Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(CLIENT_ID);
        
        if (clientAccess == null || clientAccess.isEmpty()) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        List<String> clientRoles = (List<String>) clientAccess.get(ROLES_CLAIM);
        
        // Get realm roles
        @SuppressWarnings("unchecked")
        Map<String, Object> realmAccess = (Map<String, Object>) resourceAccess.get("realm_access");
        
        List<String> realmRoles = Collections.emptyList();
        if (realmAccess != null && !realmAccess.isEmpty()) {
            realmRoles = (List<String>) realmAccess.get(ROLES_CLAIM);
        }

        // Combine and map roles to authorities
        return Stream.concat(
                clientRoles != null ? clientRoles.stream() : Stream.empty(),
                realmRoles != null ? realmRoles.stream() : Stream.empty()
            )
            .filter(role -> role != null && !role.trim().isEmpty())
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
            .collect(Collectors.toList());
    }
}
