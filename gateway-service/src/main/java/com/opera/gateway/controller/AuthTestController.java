package com.opera.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthTestController {

    @GetMapping("/api/auth/me")
    public Mono<ResponseEntity<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal OidcUser user) {
        if (user == null) {
            return Mono.just(ResponseEntity.ok(Map.of("authenticated", false)));
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("authenticated", true);
        userInfo.put("username", user.getPreferredUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("name", user.getFullName());
        userInfo.put("roles", user.getAuthorities());
        userInfo.putAll(user.getClaims());
        
        return Mono.just(ResponseEntity.ok(userInfo));
    }
}
