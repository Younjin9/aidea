package com.aidea.backend.domain.user.controller;

import com.aidea.backend.domain.user.dto.*;
import com.aidea.backend.domain.user.service.UserService;
import com.aidea.backend.domain.meeting.dto.response.MeetingResponse;
import com.aidea.backend.domain.meeting.service.MeetingService;
import com.aidea.backend.domain.meeting.dto.response.LikedMeetingResponse;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "User", description = "User API")
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MeetingService meetingService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<UserResponse>> joinUser(@Valid @RequestBody UserJoinDto dto) {
        log.info("회원가입 요청: email={}", dto.getEmail());
        UserResponse userResponse = userService.joinUser(dto);
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> loginUser(@Valid @RequestBody UserLoginDto dto) {
        log.info("로그인 요청: email={}", dto.getEmail());
        LoginResponse loginResponse = userService.loginUser(dto);
        return ResponseEntity.ok(ApiResponse.success(loginResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(ApiResponse.success("이미 로그아웃 상태입니다."));
        }
        log.info("로그아웃 요청: email={}", authentication.getName());
        userService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("로그아웃 되었습니다."));
    }

    @PostMapping("/nickname-check")
    public ResponseEntity<ApiResponse<NicknameCheckResponse>> nicknameCheck(
            @Valid @RequestBody UserNicknameCheckDto dto) {
        log.info("닉네임 중복 확인 요청: nickname={}", dto.getNickname());
        NicknameCheckResponse response = userService.checkNickname(dto.getNickname());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@RequestBody TokenRefreshResponse request) {
        log.info("토큰 재발급 요청");
        TokenRefreshResponse tokenRefreshResponse = userService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokenRefreshResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        log.info("내 프로필 조회 요청: email={}", authentication.getName());
        UserResponse userResponse = userService.getMyProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @Valid @RequestBody UserUpdateDto dto,
            Authentication authentication) {
        log.info("내 프로필 수정 요청: email={}", authentication.getName());
        UserResponse userResponse = userService.updateMyProfile(authentication.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<UpdateProfileImageResponse>> updateProfileImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        log.info("프로필 이미지 수정 요청: email={}", authentication.getName());
        UpdateProfileImageResponse response = userService.updateProfileImage(authentication.getName(), image);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me/location")
    public ResponseEntity<ApiResponse<LocationUpdateResponse>> updateMyLocation(
            @Valid @RequestBody LocationUpdateDto dto,
            Authentication authentication) {
        log.info("위치 정보 수정 요청: email={}", authentication.getName());
        LocationUpdateResponse response = userService.updateMyLocation(authentication.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me/groups")
    public ResponseEntity<ApiResponse<List<MeetingResponse>>> getMyMeetings(
            @RequestParam(value = "status", required = false) String status,
            Authentication authentication) {
        log.info("내 모임 목록 조회 요청: email={}, status={}", authentication.getName(), status);
        List<MeetingResponse> meetings = userService.getMyMeetings(authentication.getName(), status);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    @GetMapping("/me/groups/hosting")
    public ResponseEntity<ApiResponse<List<MeetingResponse>>> getMyHostingMeetings(
            Authentication authentication) {
        log.info("내가 개설한 모임 목록 조회 요청: email={}", authentication.getName());
        List<MeetingResponse> meetings = userService.getMyHostingMeetings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getMyStats(
            Authentication authentication) {
        log.info("내 통계 정보 조회 요청: email={}", authentication.getName());
        UserStatsResponse stats = userService.getMyStats(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/me/notifications/settings")
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> getNotificationSettings(
            Authentication authentication) {
        log.info("알림 설정 조회 요청: email={}", authentication.getName());
        NotificationSettingsResponse settings = userService.getNotificationSettings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PatchMapping("/me/notifications/settings")
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> updateNotificationSettings(
            @Valid @RequestBody NotificationSettingsRequest request,
            Authentication authentication) {
        log.info("알림 설정 수정 요청: email={}", authentication.getName());
        NotificationSettingsResponse settings = userService.updateNotificationSettings(
                authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        String reason = request != null ? request.get("reason") : null;
        log.info("회원 탈퇴 요청: email={}, reason={}", authentication.getName(), reason);
        userService.deleteAccount(authentication.getName(), reason);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/interests")
    public ResponseEntity<ApiResponse<Void>> updateUserInterests(
            @RequestBody Map<String, List<String>> request,
            Authentication authentication) {
        List<String> interests = request.get("interests");
        log.info("사용자 관심사 업데이트 요청: email={}, interests={}", authentication.getName(), interests);
        userService.updateUserInterests(authentication.getName(), interests);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/me/liked-groups")
    public ResponseEntity<ApiResponse<List<MeetingResponse>>> getLikedGroups(
            Authentication authentication) {
        log.info("찜한 모임 목록 조회 요청: email={}", authentication.getName());
        
        // 이메일로 사용자 ID 조회
        UserResponse userResponse = userService.getMyProfile(authentication.getName());
        Long userId = Long.parseLong(userResponse.getUserId());
        
        // MeetingService를 통해 찜한 모임 목록 조회
        var likedMeetings = meetingService.getLikedMeetings(userId);
        List<MeetingResponse> meetings = likedMeetings.stream()
                .map(LikedMeetingResponse::getMeeting)
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("User API is running perfectly!"));
    }
}