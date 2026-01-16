package com.aidea.backend.global.secret.oauth.user;

import com.aidea.backend.domain.user.enums.Provider;

public interface OAuth2UserInfo {
    String getProviderId();

    Provider getProvider();

    String getEmail();

    String getName();

    String getImageUrl();
}
