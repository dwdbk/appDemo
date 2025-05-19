package com.opera.shows;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ShowsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShowsServiceApplication.class, args);
    }
}
