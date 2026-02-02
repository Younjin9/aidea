package com.aidea.backend.domain.meeting.service;

import com.aidea.backend.domain.meeting.dto.response.MeetingSummaryResponse;
import com.aidea.backend.domain.meeting.dto.response.ShareCreationResponse;
import com.aidea.backend.domain.meeting.entity.Meeting;
import com.aidea.backend.domain.meeting.entity.MeetingMember;
import com.aidea.backend.domain.meeting.entity.MeetingShare;
import com.aidea.backend.domain.meeting.entity.enums.MemberStatus;
import com.aidea.backend.domain.meeting.repository.MeetingMemberRepository;
import com.aidea.backend.domain.meeting.repository.MeetingRepository;
import com.aidea.backend.domain.event.entity.Event;
import com.aidea.backend.domain.event.repository.EventRepository;
import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
// import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingShareService {

    // private final MeetingShareRepository meetingShareRepository;
    private final MeetingRepository meetingRepository;
    private final EventRepository eventRepository;
    private final MeetingMemberRepository meetingMemberRepository;
    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uris:http://localhost:5173}")
    private String baseUrl; // Use base URL for share link construction (simplification)

    // Fallback domain if config is list
    private String getDomain() {
        if (baseUrl != null && baseUrl.contains(",")) {
            return baseUrl.split(",")[0].replace("/oauth/callback", "");
        }
        return "https://aimo.ai.kr"; // Default production domain
    }

    @Transactional
    public ShareCreationResponse createShareLink(Long meetingId, Long userId) {
        // 1. Validate Meeting existence
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        // 2. Validate User is an APPROVED Member (or Host)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        MeetingMember member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId)
                .orElseThrow(() -> new IllegalArgumentException("모임 멤버가 아닙니다."));

        if (member.getStatus() != MemberStatus.APPROVED) {
            throw new IllegalArgumentException("승인된 멤버만 공유할 수 있습니다.");
        }

        // 3. Generate Simple URL
        String domain = getDomain();
        if (domain.endsWith("/"))
            domain = domain.substring(0, domain.length() - 1);
        String shareUrl = domain + "/meetings/" + meetingId;

        List<String> messages = List.of(
                "🎉 재미있는 모임을 발견했어요! [" + meeting.getTitle() + "]에 초대합니다!",
                "✨ 흥미로운 모임 [" + meeting.getTitle() + "]을 공유합니다! 함께 해요!",
                "💫 이 모임 어때요? [" + meeting.getTitle() + "] 참여해보세요!");

        return ShareCreationResponse.of(null, shareUrl, null, messages);
    }

    @Transactional
    public ShareCreationResponse createEventShareLink(Long meetingId, Long eventId, Long userId) {
        // 1. Validate Meeting & Event
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));

        if (!event.getMeeting().getId().equals(meetingId)) {
            throw new IllegalArgumentException("해당 모임의 일정이 아닙니다.");
        }

        // 2. Validate User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        MeetingMember member = meetingMemberRepository.findByMeetingIdAndUser_UserId(meetingId, userId)
                .orElseThrow(() -> new IllegalArgumentException("모임 멤버가 아닙니다."));

        if (member.getStatus() != MemberStatus.APPROVED) {
            throw new IllegalArgumentException("승인된 멤버만 공유할 수 있습니다.");
        }

        // 3. Generate Simple URL
        String domain = getDomain();
        if (domain.endsWith("/"))
            domain = domain.substring(0, domain.length() - 1);
        String shareUrl = domain + "/meetings/" + meetingId + "/events/" + eventId; // Direct link to event detail

        List<String> messages = List.of(
                "📅 정모 일정이 공유되었어요! [" + event.getTitle() + "]",
                "✨ [" + meeting.getTitle() + "]의 정모 [" + event.getTitle() + "]에 참여해보세요!",
                "🚀 함께해요! [" + event.getDate().toString() + "] " + event.getTitle());

        return ShareCreationResponse.of(null, shareUrl, null, messages);
    }

    /*
     * public MeetingSummaryResponse getMeetingByToken(String token) {
     * MeetingShare share = meetingShareRepository.findByShareToken(token)
     * .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 공유 링크입니다."));
     * 
     * if (share.getExpiresAt().isBefore(LocalDateTime.now())) {
     * throw new IllegalArgumentException("만료된 공유 링크입니다."); // Should be mapped to
     * 410 Gone
     * }
     * 
     * return toMeetingSummaryResponse(share.getMeeting());
     * }
     */

    /*
     * private String generateUniqueToken() {
     * String token;
     * do {
     * token = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
     * } while (meetingShareRepository.existsByShareToken(token));
     * return token;
     * }
     * 
     * private ShareCreationResponse toShareCreationResponse(MeetingShare share,
     * Meeting meeting) {
     * String domain = getDomain();
     * // Remove trailing slash if present
     * if (domain.endsWith("/"))
     * domain = domain.substring(0, domain.length() - 1);
     * 
     * String shareUrl = domain + "/share/" + share.getShareToken();
     * 
     * List<String> messages = List.of(
     * "🎉 재미있는 모임을 발견했어요! [" + meeting.getTitle() + "]에 초대합니다!",
     * "✨ 흥미로운 모임 [" + meeting.getTitle() + "]을 공유합니다! 함께 해요!",
     * "💫 이 모임 어때요? [" + meeting.getTitle() + "] 참여해보세요!");
     * 
     * return ShareCreationResponse.of(share.getShareToken(), shareUrl,
     * share.getExpiresAt(), messages);
     * }
     */

    private MeetingSummaryResponse toMeetingSummaryResponse(Meeting meeting) {
        // Simplified mapping for public view
        return MeetingSummaryResponse.builder()
                .groupId(meeting.getId())
                .title(meeting.getTitle())
                .imageUrl(meeting.getImageUrl())
                // .interestCategoryId(...) // Requires mapping logic, skipping or simplifying
                .interestCategoryName(meeting.getCategory().name()) // Using enum name as fallback
                .region(meeting.getRegion())
                .regionFullName(meeting.getRegion().name()) // Using enum name as fallback
                .location(meeting.getLocation())
                .meetingDate(meeting.getMeetingDate())
                .currentMembers(meeting.getCurrentMembers())
                .maxMembers(meeting.getMaxMembers())
                .status(meeting.getStatus())
                .myRole("NONE") // Public view
                .myStatus("NONE") // Public view
                .build();
    }
}
