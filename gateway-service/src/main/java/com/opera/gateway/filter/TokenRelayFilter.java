package com.opera.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class TokenRelayFilter extends AbstractGatewayFilterFactory<Object> {
    private final ReactiveOAuth2AuthorizedClientManager authorizedClientManager;

    public TokenRelayFilter(ReactiveOAuth2AuthorizedClientManager authorizedClientManager) {
        super(Object.class);
        this.authorizedClientManager = authorizedClientManager;
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) ->
            ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(authentication -> authentication instanceof OAuth2AuthenticationToken)
                .cast(OAuth2AuthenticationToken.class)
                .flatMap(authentication -> {
                    String registrationId = authentication.getAuthorizedClientRegistrationId();
                    return authorizedClientManager.authorize(
                        OAuth2AuthorizeRequest
                            .withClientRegistrationId(registrationId)
                            .principal(authentication)
                            .build()
                    );
                })
                .map(OAuth2AuthorizedClient::getAccessToken)
                .map(token -> withBearerAuth(exchange.getRequest(), token))
                .defaultIfEmpty(exchange.getRequest())
                .flatMap(request -> chain.filter(exchange.mutate().request(request).build()));
    }

    private ServerHttpRequest withBearerAuth(ServerHttpRequest request, OAuth2AccessToken accessToken) {
        return request.mutate()
            .header("Authorization", "Bearer " + accessToken.getTokenValue())
            .build();
    }
}
