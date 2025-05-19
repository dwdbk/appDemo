package com.opera.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import com.opera.gateway.filter.TokenRelayFilter;

import java.util.Arrays;
import java.util.Collections;

@SpringBootApplication
public class GatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, TokenRelayFilter tokenRelayFilter) {
        return builder.routes()
                // Route for Opera Service
                .route("opera-service", r -> r.path("/opera/**")
                        .filters(f -> f
                                .filter(tokenRelayFilter.apply(new Object()))
                                .rewritePath("/opera/(?<segment>.*)", "/api/${segment}"))
                        .uri("http://localhost:8081"))
                
                // Route for Shows Service
                .route("shows-service", r -> r.path("/shows/**")
                        .filters(f -> f
                                .filter(tokenRelayFilter.apply(new Object()))
                                .rewritePath("/shows/(?<segment>.*)", "/api/${segment}"))
                        .uri("http://localhost:8082"))
                
                // Route for GraphQL Playground - public access
                .route("graphql-playground", r -> r.path("/playground")
                        .uri("http://localhost:8080/playground.html"))
                        
                // Route for OAuth2 login
                .route("auth", r -> r.path("/login/**", "/oauth2/**")
                        .uri("http://localhost:8080"))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        final CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Collections.singletonList("*"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.addAllowedHeader("*");

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
