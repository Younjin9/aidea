package com.aidea.backend.domain.recommendation.ai;

import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.recommendation.repository.MeetingVectorUpsertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingVectorSyncService {

    private final TitanEmbeddingClient titanEmbeddingClient;
    private final MeetingVectorUpsertRepository meetingVectorUpsertRepository;
    private final MeetingRepository meetingRepository;

    public void syncOne(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("meeting not found: " + meetingId));

        String text = buildMeetingText(meeting);

        float[] embedding = titanEmbeddingClient.embedToFloatArray(text);
        meetingVectorUpsertRepository.upsert(meetingId, embedding);

        log.info("[MEETING-VECTOR-SYNC] synced meetingId={}, dim={}", meetingId, embedding.length);
    }

    private String buildMeetingText(Meeting m) {
        StringBuilder sb = new StringBuilder();
        sb.append("[제목] ").append(nvl(m.getTitle())).append("\n");
        sb.append("[설명] ").append(nvl(m.getDescription())).append("\n");
        if (m.getCategory() != null) sb.append("[카테고리] ").append(m.getCategory().name()).append("\n");
        if (m.getRegion() != null) sb.append("[지역] ").append(m.getRegion().name()).append("\n");
        sb.append("[인원] ").append(m.getCurrentMembers()).append("/").append(m.getMaxMembers()).append("\n");
        return sb.toString();
    }

    private String nvl(String s) {
        return (s == null) ? "" : s;
    }
}