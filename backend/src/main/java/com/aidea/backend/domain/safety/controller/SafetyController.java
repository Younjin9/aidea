package com.aidea.backend.domain.safety.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Safety", description = "Safety API (Report/Block)")
@RestController
@RequestMapping("/api/v1/safety")
@RequiredArgsConstructor
public class SafetyController {
}
