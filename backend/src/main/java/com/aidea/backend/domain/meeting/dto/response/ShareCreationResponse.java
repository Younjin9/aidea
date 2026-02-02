package com.aidea.backend.domain.meeting.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ShareCreationResponse {
    private String shareToken;
    private String shareUrl;
    private LocalDateTime expiresAt;
    private List<String> messages;

    public static ShareCreationResponse of(String shareToken, String shareUrl, LocalDateTime expiresAt,
            List<String> messages) {
        return ShareCreationResponse.builder()
                .shareToken(shareToken)
                .shareUrl(shareUrl)
                .expiresAt(expiresAt)
                .messages(messages)
                .build();
    }
}
