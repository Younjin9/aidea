# ========================================
# Stage 1: 빌드 스테이지
# ========================================
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Gradle Wrapper 및 의존성 파일 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./

# 의존성 다운로드 (캐싱 최적화)
RUN gradle dependencies --no-daemon || return 0

# 소스 코드 복사
COPY src ./src

# 빌드 실행
RUN gradle clean bootJar -x test --no-daemon

# 생성된 JAR 파일 확인
RUN echo "=== Build completed ===" && \
    ls -lah /app/build/libs/

# ========================================
# Stage 2: 실행 스테이지
# ========================================
FROM eclipse-temurin:17-jre-alpine

# 타임존 및 필수 도구 설치
RUN apk add --no-cache \
    tzdata \
    curl \
    wget && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 JAR 파일 복사
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar /app/app.jar

# 로그 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/logs && \
    chmod -R 755 /app && \
    addgroup -g 1000 spring && \
    adduser -u 1000 -G spring -s /bin/sh -D spring && \
    chown -R spring:spring /app

# 비root 사용자로 전환
USER spring:spring

# 포트 노출
EXPOSE 8080

# ⭐ 헬스체크 수정 - 시작 시간 증가 및 간격 조정
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM 옵션과 함께 애플리케이션 실행
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Duser.timezone=Asia/Seoul", \
    "-jar", \
    "/app/app.jar"]