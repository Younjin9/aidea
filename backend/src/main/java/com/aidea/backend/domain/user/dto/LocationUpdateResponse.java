package com.aidea.backend.domain.user.dto;

import com.aidea.backend.domain.user.dto.UserResponse.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateResponse {
    private boolean updated;
    private Location location;
}