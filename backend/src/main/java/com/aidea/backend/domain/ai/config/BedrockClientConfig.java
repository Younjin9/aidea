package com.aidea.backend.domain.ai.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

@Configuration
@Slf4j
public class BedrockClientConfig {

    @Value("${spring.cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${spring.cloud.aws.bedrock.region:ap-northeast-2}")
    private String bedrockRegion;

    @Bean
    public BedrockRuntimeClient bedrockRuntimeClient() {
        log.info("=== Configuring BedrockRuntimeClient ===");
        log.info("Access Key: {}...", accessKey != null ? accessKey.substring(0, 10) : "NULL");
        log.info("Secret Key: {}...", secretKey != null ? secretKey.substring(0, 10) : "NULL");
        log.info("Bedrock Region: {}", bedrockRegion);

        // 명시적으로 자격 증명 설정
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                accessKey,
                secretKey
        );

        BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .region(Region.of(bedrockRegion))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        log.info("✅ BedrockRuntimeClient configured successfully");
        return client;
    }
}