package com.aidea.backend.domain.user.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserJoinDto {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 4, max = 20, message = "비밀번호는 4자 이상 20자 이하여야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다.")
    private String nickname;

    // @NotBlank(message = "전화번호는 필수입니다.")
    // @Pattern(regexp = "^\\d{3}-\\d{4}-\\d{4}$",
    // message = "전화번호 형식이 올바르지 않습니다.(예: 010-1234-5678")
    private String phoneNumber;

    @Past(message = "생년월일은 과거 날짜여야 합니다.")
    LocalDate birthDate;

    // @NotBlank(message = "성별을 선택해주세요.")
    private String gender;

    @URL(message = "URL만 허용됩니다.")
    private String profileImage;

    // @NotBlank(message = "주소는 필수입니다.")
    // @Size(max = 100, message = "주소는 100자를 초과할 수 없습니다.")
    private String location;

    // @NotNull(message = "위도는 필수입니다.")
    // @Range(min = -90, max = 90, message = "위도는 -90 ~ 90 사이의 값이어야 합니다.")
    // @Digits(integer = 2, fraction = 15, message = "위도 형식이 올바르지 않습니다.")
    private Double latitude;

    // @NotNull(message = "경도는 필수입니다.")
    // @Range(min = -180, max = 180, message = "위도는 -180 ~ 180 사이의 값이어야 합니다.")
    // @Digits(integer = 3, fraction = 15, message = "경도 형식이 올바르지 않습니다.")
    private Double longitude;
}
