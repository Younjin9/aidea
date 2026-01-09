# Aidea Backend

Location-based AI Short-form Meeting Platform Backend.

## 🛠 Tech Stack
- **Java**: 17
- **Framework**: Spring Boot 3.2.1
- **Build**: Gradle (Manually configured, Wrapper not included yet)
- **Database**: MySQL 8.0, Redis
- **Security**: Spring Security, OAuth2 Client
- **AI**: Spring AI

## 🚀 Getting Started

### 1. Prerequisites
- Java 17+
- Docker & Docker Compose
- Gradle (if running from CLI without wrapper)

### 2. Run Infrastructure
```bash
docker-compose up -d
```

### 3. Run Application
If you have Gradle installed:
```bash
gradle bootRun
```
Or use your IDE (IntelliJ IDEA) to import the `backend` folder as a Gradle project.
