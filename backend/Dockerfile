# 빌드 스테이지
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Gradle 캐시 최적화
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || return 0

# 소스 복사 및 빌드
COPY src ./src
RUN gradle clean build -x test --no-daemon

# JAR 파일 확인 및 이름 표준화
RUN mkdir -p /app/final && \
    cp /app/build/libs/*.jar /app/final/app.jar && \
    echo "JAR file created successfully"

# Layered JAR 추출 (실패 시 일반 JAR 사용)
RUN cd /app/final && \
    (java -Djarmode=layertools -jar app.jar extract || \
     echo "Layered JAR extraction failed, using standard JAR")

# 실행 스테이지
FROM eclipse-temurin:17-jre-alpine

# 타임존 및 필수 도구 설치
ENV TZ=Asia/Seoul
RUN apk add --no-cache \
    tzdata \
    wget \
    curl && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# Layered JAR 복사 (있으면)
COPY --from=builder /app/final/dependencies/ ./ 2>/dev/null || true
COPY --from=builder /app/final/spring-boot-loader/ ./ 2>/dev/null || true
COPY --from=builder /app/final/snapshot-dependencies/ ./ 2>/dev/null || true
COPY --from=builder /app/final/application/ ./ 2>/dev/null || true

# 일반 JAR도 복사 (백업)
COPY --from=builder /app/final/app.jar ./app.jar 2>/dev/null || true

# 보안: 전용 사용자 생성
RUN addgroup -S spring && \
    adduser -S spring -G spring && \
    chown -R spring:spring /app
USER spring:spring

EXPOSE 8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Layered JAR가 있으면 JarLauncher, 없으면 일반 실행
ENTRYPOINT ["sh", "-c", "\
    if [ -f org/springframework/boot/loader/launch/JarLauncher.class ] || [ -f org/springframework/boot/loader/JarLauncher.class ]; then \
        java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 org.springframework.boot.loader.JarLauncher; \
    else \
        java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar; \
    fi"]