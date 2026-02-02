package com.aidea.backend.domain.safety.entity.enums;

public enum ReportReason {
  ABUSE("욕설/비하"),
  INAPPROPRIATE("부적절한 콘텐츠"),
  SPAM("스팸/홍보");

  private final String description;

  ReportReason(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }
}
