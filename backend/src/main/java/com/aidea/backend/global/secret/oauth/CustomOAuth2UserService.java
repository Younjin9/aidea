package com.aidea.backend.global.secret.oauth;

import com.aidea.backend.domain.user.entity.User;
import com.aidea.backend.domain.user.enums.Provider;
import com.aidea.backend.domain.user.repository.UserRepository;
import com.aidea.backend.global.secret.oauth.user.KakaoUserInfo;
import com.aidea.backend.global.secret.oauth.user.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("OAuth2 User loaded attributes: {}", oAuth2User.getAttributes());

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = null;

        if (registrationId.equals("kakao")) {
            oAuth2UserInfo = new KakaoUserInfo(oAuth2User.getAttributes());
        } else {
            log.error("Unsupported provider: {}", registrationId);
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        saveOrUpdateUser(oAuth2UserInfo);

        // Principal의 이름을 email로 변경하기 위해 속성 맵을 복사하고 email 추가
        Map<String, Object> modifiedAttributes = new HashMap<>(oAuth2User.getAttributes());
        modifiedAttributes.put("email", oAuth2UserInfo.getEmail());

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                modifiedAttributes,
                "email");
    }

    private void saveOrUpdateUser(OAuth2UserInfo oAuth2UserInfo) {
        String email = oAuth2UserInfo.getEmail();
        String name = oAuth2UserInfo.getName();
        Provider provider = oAuth2UserInfo.getProvider();

        log.info("OAuth2 사용자 정보 - 이메일: {}, 이름: {}, 제공자: {}", email, name, provider);

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            // 기존 사용자 업데이트
            user = userOptional.get();
            log.info("기존 OAuth2 사용자 정보 업데이트: {}", email);
            updateExistingUser(user, oAuth2UserInfo);
        } else {
            // 새 사용자 생성
            log.info("새로운 OAuth2 사용자 생성: {}", email);
            user = createNewUser(oAuth2UserInfo);
        }
        userRepository.save(user);
    }

    private void updateExistingUser(User user, OAuth2UserInfo oAuth2UserInfo) {
        // 필요한 경우 정보 업데이트
        if (!user.getNickname().equals(oAuth2UserInfo.getName())) {
            user.setNickname(oAuth2UserInfo.getName());
        }
        if (!user.getProfileImage().equals(oAuth2UserInfo.getImageUrl())) {
            user.setProfileImage(oAuth2UserInfo.getImageUrl());
        }
    }

    private User createNewUser(OAuth2UserInfo oAuth2UserInfo) {
        return User.builder()
                .email(oAuth2UserInfo.getEmail())
                .nickname(oAuth2UserInfo.getName())
                .profileImage(oAuth2UserInfo.getImageUrl())
                .provider(oAuth2UserInfo.getProvider())
                .providerId(oAuth2UserInfo.getProviderId())
                .password("") // OAuth2 사용자는 비밀번호 없음
                .build();
    }
}
