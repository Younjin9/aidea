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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<UserResponse>> joinUser(@Valid @RequestBody UserJoinDto dto){
        log.info("회원가입 요청: email={}", dto.getEmail());
        UserResponse userResponse = userService.joinUser(dto);
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> loginUser(@Valid @RequestBody UserLoginDto dto){
        log.info("로그인 요청: email={}", dto.getEmail());
        LoginResponse loginResponse = userService.loginUser(dto);
        return ResponseEntity.ok(ApiResponse.success(loginResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(Authentication authentication){
        if (authentication != null){
            return ResponseEntity.ok(ApiResponse.success("이미 로그아웃 상태입니다."));
        }
        log.info("로그아웃 요청: email={}", authentication.getName());
        userService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("로그아웃 되없습니다."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@RequestBody TokenRefreshResponse request){
        log.info("토큰 재발급 요청");
        TokenRefreshResponse tokenRefreshResponse = userService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokenRefreshResponse));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("User API is running perfectly!"));
    }
}
