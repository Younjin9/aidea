package com.aidea.backend.domain.event.controller;

import com.aidea.backend.domain.event.dto.request.CreateEventRequest;
import com.aidea.backend.domain.event.dto.request.UpdateEventRequest;
import com.aidea.backend.domain.event.dto.response.EventDetailResponse;
import com.aidea.backend.domain.event.service.EventService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Event", description = "모임 일정(정모) API")
@RestController
@RequestMapping("/api/groups/{meetingId}/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final com.aidea.backend.domain.user.repository.UserRepository userRepository;

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null)
                return null;
            String email = auth.getName();
            return userRepository.findByEmail(email)
                    .map(com.aidea.backend.domain.user.entity.User::getUserId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Long getAuthenticatedUserId() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return userId;
    }

    @Operation(summary = "일정 목록 조회")
    @GetMapping
    public ApiResponse<List<EventDetailResponse>> getEvents(@PathVariable Long meetingId) {
        return ApiResponse.success(eventService.getEvents(meetingId, getCurrentUserId())); // Pass userId
    }

    @Operation(summary = "일정 상세 조회")
    @GetMapping("/{eventId}")
    public ApiResponse<EventDetailResponse> getEvent(@PathVariable Long meetingId, @PathVariable Long eventId) {
        return ApiResponse.success(eventService.getEvent(meetingId, eventId, getCurrentUserId())); // Pass userId
    }

    @Operation(summary = "일정 생성")
    @PostMapping
    public ApiResponse<EventDetailResponse> createEvent(
            @PathVariable Long meetingId,
            @Valid @RequestBody CreateEventRequest request) {
        return ApiResponse.success(eventService.createEvent(meetingId, getAuthenticatedUserId(), request));
    }

    @Operation(summary = "일정 수정")
    @PatchMapping("/{eventId}") // Frontend uses PATCH
    public ApiResponse<EventDetailResponse> updateEvent(
            @PathVariable Long meetingId,
            @PathVariable Long eventId,
            @RequestBody UpdateEventRequest request) { // Valid optional depending on patch logic
        return ApiResponse.success(eventService.updateEvent(meetingId, eventId, getAuthenticatedUserId(), request));
    }

    @Operation(summary = "일정 삭제")
    @DeleteMapping("/{eventId}")
    public ApiResponse<Void> deleteEvent(
            @PathVariable Long meetingId,
            @PathVariable Long eventId) {
        eventService.deleteEvent(meetingId, eventId, getAuthenticatedUserId());
        return ApiResponse.success(null);
    }

    @Operation(summary = "일정 참석")
    @PostMapping("/{eventId}/participate")
    public ApiResponse<Void> participateEvent(
            @PathVariable Long meetingId,
            @PathVariable Long eventId) {
        eventService.participateEvent(meetingId, eventId, getAuthenticatedUserId());
        return ApiResponse.success(null);
    }

    @Operation(summary = "일정 참석 취소")
    @DeleteMapping("/{eventId}/participate")
    public ApiResponse<Void> cancelParticipation(
            @PathVariable Long meetingId,
            @PathVariable Long eventId) {
        eventService.cancelParticipation(meetingId, eventId, getAuthenticatedUserId());
        return ApiResponse.success(null);
    }
}
