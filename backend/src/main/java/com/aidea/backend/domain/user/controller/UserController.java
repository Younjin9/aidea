package com.aidea.backend.domain.user.controller;

import com.aidea.backend.domain.user.dto.LoginResponse;
import com.aidea.backend.domain.user.dto.UserJoinDto;
import com.aidea.backend.domain.user.dto.UserLoginDto;
import com.aidea.backend.domain.user.dto.UserResponse;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.domain.user.service.UserService;
import com.aidea.backend.global.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


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

    @PostMapping("login")
    public ResponseEntity<ApiResponse<LoginResponse>> LoginUser(@Valid @RequestBody UserLoginDto dto){
        log.info("로그인 요청: email={}", dto.getEmail());
        LoginResponse loginResponse = userService.loginUser(dto);
        return ResponseEntity.ok(ApiResponse.success(loginResponse));
    }

}
