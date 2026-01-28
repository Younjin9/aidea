package com.aidea.backend.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {

    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String nickname;

    @Size(max = 200, message = "자기소개는 200자 이하여야 합니다.")
    private String bio;

    @Size(max = 500, message = "프로필 이미지 URL은 500자 이하여야 합니다.")
    private String profileImage;

    @Size(max = 20, message = "전화번호는 20자 이하여야 합니다.")
    private String phoneNumber;

    private String gender;

    @Size(max = 100, message = "주소는 100자 이하여야 합니다.")
    private String location;

    private Double latitude;

    private Double longitude;
}