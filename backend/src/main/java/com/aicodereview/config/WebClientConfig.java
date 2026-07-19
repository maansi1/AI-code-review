package com.aicodereview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * RestClient (Spring 6.1+/Boot 3.2+) is used instead of WebClient so we don't
 * need to pull in the reactive (WebFlux) stack just to call the Gemini REST API.
 */
@Configuration
public class WebClientConfig {

    @Bean
    public RestClient aiRestClient() {
        return RestClient.builder().build();
    }
}
