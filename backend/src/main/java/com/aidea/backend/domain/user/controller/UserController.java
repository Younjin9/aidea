package com.aidea.backend.domain.user.controller;

import com.aidea.backend.domain.user.dto.*;
import com.aidea.backend.domain.user.service.UserService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "User API")
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
            @RequestParam("image") String imageUrl,
            Authentication authentication) {
        log.info("프로필 이미지 수정 요청: email={}", authentication.getName());
        UpdateProfileImageResponse response = userService.updateProfileImage(authentication.getName(), imageUrl);
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

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("User API is running perfectly!"));
    }
}