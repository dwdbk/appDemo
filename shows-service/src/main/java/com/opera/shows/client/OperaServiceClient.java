package com.opera.shows.client;

import com.opera.shows.model.Opera;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "opera-service", url = "${opera.service.url}")
public interface OperaServiceClient {

    @GetMapping("/api/operas/{id}")
    Opera getOperaById(@PathVariable("id") String id);
}
