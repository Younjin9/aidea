package com.aidea.backend.global.secret.jwt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@Builder
@AllArgsConstructor
@RedisHash(value = "refreshToken", timeToLive = 1209600)
public class RefreshToken {

    @Id
    private String token;

    @Indexed
    private String email;

    private long userId;
}
