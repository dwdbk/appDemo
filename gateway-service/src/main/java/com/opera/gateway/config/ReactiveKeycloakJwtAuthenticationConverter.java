package com.opera.gateway.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import reactor.core.publisher.Mono;

import java.util.Collection;

public class ReactiveKeycloakJwtAuthenticationConverter implements Converter<Jwt, Mono<AbstractAuthenticationToken>> {

    private final Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter;

    public ReactiveKeycloakJwtAuthenticationConverter(KeycloakJwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter) {
        this.jwtGrantedAuthoritiesConverter = new ReactiveJwtGrantedAuthoritiesConverterAdapter(jwtGrantedAuthoritiesConverter);
    }

    @Override
    public Mono<AbstractAuthenticationToken> convert(Jwt jwt) {
        return this.jwtGrantedAuthoritiesConverter.convert(jwt)
                .map(authorities -> new JwtAuthenticationToken(jwt, authorities, getPrincipalClaimName(jwt)));
    }

    protected String getPrincipalClaimName(Jwt jwt) {
        return jwt.getClaimAsString("preferred_username");
    }
}
