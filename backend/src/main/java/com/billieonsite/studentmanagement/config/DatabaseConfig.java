package com.billieonsite.studentmanagement.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.billieonsite.studentmanagement.repository")
@EntityScan(basePackages = "com.billieonsite.studentmanagement.model")
public class DatabaseConfig {
}