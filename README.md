<div align="center">

# 📍 Aidea

### 위치 기반 AI 숏폼 모임 매칭 플랫폼

**내 주변의 즐거움, 숏폼으로 탐색하고 AI로 똑똑하게 연결하세요.**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Younjin9/aidea)

</div>

---

## 📖 프로젝트 소개

**Aidea**는 위치 기반 기술과 AI 추천 시스템을 결합한 **하이브리드 모임 플랫폼**입니다.
기존의 텍스트 중심 모임 탐색에서 벗어나 **숏폼(Short-form)** UI를 통해 모임의 분위기를 직관적으로 파악하고,
개인화된 AI 알고리즘을 통해 최적의 커뮤니티를 매칭해 줍니다.

### 개발 기간
**2026.01.10 ~ 2026.02.28** (약 7주)

### 프로젝트 목표
- 위치 기반 실시간 모임 탐색 및 매칭 시스템 구현
- AWS Bedrock 기반 AI 추천 엔진 설계 및 적용
- WebSocket 실시간 채팅 및 알림 시스템 구축
- 카카오 Maps API 연동을 통한 위치 서비스 구현

---

## ✨ 주요 기능

<table>
<tr>
<td width="50%">

### 📍 위치 기반 탐색
- 🗺️ **실시간 위치 매칭**
  - 현재 위치 기반 반경 내 모임 조회
  - 카카오 Maps API 연동 지도 탐색
  - 주소 검색 및 거리 기반 필터링
- 🎬 **숏폼 UI**
  - 카드 스와이프 방식의 모임 탐색
  - 모임 분위기 영상/이미지 미리보기

</td>
<td width="50%">

### 🤖 AI 추천 시스템
- 🧠 **개인화 추천**
  - AWS Bedrock (Titan Embedding) 기반 벡터 검색
  - 사용자 관심사 분석 및 취향 매칭
- 🎯 **스마트 매칭**
  - 위치 + 관심사 복합 추천 알고리즘
  - 실시간 추천 결과 업데이트

</td>
</tr>
<tr>
<td width="50%">

### 💬 실시간 소통
- 📩 **실시간 채팅**
  - WebSocket 기반 모임별 채팅방
  - 채팅 기록 자동 저장 및 조회
- 🔔 **알림 시스템**
  - 모임 참가 신청/승인 알림
  - 실시간 푸시 알림

</td>
<td width="50%">

### 👥 모임 관리
- 📋 **모임 CRUD**
  - 모임 생성 / 수정 / 삭제
  - 참가 신청 및 승인/거절 처리
- 📅 **일정 관리**
  - 모임별 이벤트 생성 및 조회
  - 참여 멤버 관리

</td>
</tr>
<tr>
<td width="50%">

### 🔐 인증 & 보안
- 🔑 **JWT 인증**
  - Spring Security 기반 토큰 인증
  - Refresh Token 자동 갱신
- 👤 **회원 관리**
  - 회원가입 / 로그인
  - 관심사 등록 및 프로필 관리

</td>
<td width="50%">

### 🌐 위치 서비스
- 📌 **카카오 API 연동**
  - 카카오 로컬 API 위치 정보 조회
  - 좌표 기반 주소 변환
- 🗺️ **지도 통합**
  - 모임 위치 마커 표시
  - 뷰포트 기반 데이터 로딩 최적화

</td>
</tr>
</table>

---

## 🛠 기술 스택

<table>
<tr>
<td width="50%" valign="top">

### 🎨 Frontend
| 분류 | 기술 스택 |
|------|----------|
| **Framework** | React 18, TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Architecture** | FSD (Feature-Sliced Design) |
| **State Management** | Zustand, TanStack Query |
| **HTTP Client** | Axios |
| **Real-time** | WebSocket |
| **Maps** | Kakao Maps API |

</td>
<td width="50%" valign="top">

### ⚙️ Backend
| 분류 | 기술 스택 |
|------|----------|
| **Framework** | Spring Boot 3.3 |
| **Language** | Java 17 |
| **Database** | MySQL 8.0 |
| **Cache** | Redis |
| **Security** | Spring Security, JWT |
| **Real-time** | WebSocket |
| **AI/Cloud** | AWS Bedrock (Titan Embedding) |
| **Storage** | AWS S3, CloudFront |
| **Docs** | Swagger |

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🚀 DevOps
| 분류 | 기술 스택 |
|------|----------|
| **Container** | Docker |
| **Cloud** | AWS EC2, S3, CloudFront |
| **CI/CD** | GitHub Actions |

</td>
<td width="50%" valign="top">

### 🤝 협업 도구
| 분류 | 도구 |
|------|------|
| **버전 관리** | Git, GitHub |
| **프로젝트 관리** | Notion |
| **API 문서** | Swagger |
| **디자인** | Figma |

</td>
</tr>
</table>

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Auth    │  │ Meeting  │  │   Chat   │  │   Map    │        │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                         │                                        │
│                  Axios + WebSocket                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTPS / WSS
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   Backend (Spring Boot)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Auth   │  │ Meeting  │  │   Chat   │  │   AI     │        │
│  │Controller│  │Controller│  │Controller│  │Controller│        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       └─────────────┴──────────────┴──────────────┘             │
│                       Service Layer                              │
│       ┌─────────────┬──────────────┬──────────────┐             │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼──────┐       │
│  │   JPA    │  │  Redis   │  │  Kakao   │  │  AWS      │       │
│  │Repository│  │  Cache   │  │  API     │  │  Bedrock  │       │
│  └────┬─────┘  └──────────┘  └──────────┘  └───────────┘       │
└───────┼─────────────────────────────────────────────────────────┘
        │
┌───────▼──────┐
│    MySQL     │
│   Database   │
└──────────────┘
```

---

## 🎯 주요 기능 설명

### 1. 위치 기반 모임 매칭
- **카카오 Maps API**: 실시간 위치 좌표를 활용한 반경 내 모임 탐색
- **카카오 로컬 API**: 키워드/주소 기반 위치 정보 조회
- **뷰포트 최적화**: 지도 드래그 시 Debounce 처리로 API 호출 최소화

### 2. AI 추천 엔진
- **AWS Bedrock (Titan Embedding)**: 사용자 관심사 벡터화 및 유사도 기반 매칭
- **개인화 알고리즘**: 위치 + 관심사 복합 가중치 추천
- **실시간 업데이트**: 관심사 변경 시 추천 결과 즉시 반영

### 3. 실시간 채팅 시스템
- **WebSocket**: 모임별 독립 채팅방 운영
- **Redis**: 메시지 캐싱 및 빠른 조회
- **채팅 기록**: MySQL 영구 저장 및 페이지네이션 조회

### 4. 모임 참가 프로세스
- **신청 → 승인 흐름**: 참가 신청 저장 → 호스트 알림 → 승인/거절 처리
- **멤버 상태 관리**: Pending → Active 상태 전환
- **실시간 알림**: 승인 결과 즉시 통보

### 5. 성능 최적화
- **N+1 쿼리 해결**: `@EntityGraph` 및 Fetch Join 도입으로 쿼리 수 감소
- **지도 최적화**: 마커 클러스터링 + Debounce로 API 과부하 방지
- **Redis 캐싱**: 자주 조회되는 모임 데이터 캐싱

---

## 📡 API 명세

<details>
<summary><b>👤 인증 API</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/users/join` | 회원가입 | ❌ |
| `POST` | `/api/users/login` | 로그인 | ❌ |
| `GET` | `/api/users/me` | 내 정보 조회 | ✅ |
| `PATCH` | `/api/users/me` | 내 정보 수정 | ✅ |
| `PUT` | `/api/users/interests` | 관심사 수정 | ✅ |
| `POST` | `/api/users/nickname-check` | 닉네임 중복 확인 | ❌ |

</details>

<details>
<summary><b>🤝 모임 API</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/groups` | 모임 목록 조회 | ❌ |
| `POST` | `/api/groups` | 모임 생성 | ✅ |
| `GET` | `/api/groups/{id}` | 모임 상세 조회 | ❌ |
| `POST` | `/api/groups/{id}/join` | 모임 참가 신청 | ✅ |
| `POST` | `/api/groups/{id}/like` | 모임 찜하기 | ✅ |
| `GET` | `/api/groups/search` | 모임 검색 | ❌ |

</details>

<details>
<summary><b>📅 일정 API</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/groups/{meetingId}/events` | 일정 목록 조회 | ✅ |
| `POST` | `/api/groups/{meetingId}/events` | 일정 생성 | ✅ |

</details>

<details>
<summary><b>💬 채팅 & AI API</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/chat/rooms` | 내 채팅방 목록 | ✅ |
| `GET` | `/api/chat/meetings/{mId}/messages` | 메시지 조회 | ✅ |
| `POST` | `/api/chat/rooms` | 채팅방 생성 | ✅ |
| `GET` | `/api/recommendations` | AI 기반 모임 추천 | ✅ |

</details>

---

## 💻 로컬 개발 환경 설정

### 필수 요구사항
- **Java** 17 이상
- **Node.js** 18 이상
- **Docker** & **Docker Compose**

### 빠른 시작 (Quick Start)

```bash
# 1. 저장소 클론
git clone https://github.com/Younjin9/aidea.git
cd aidea

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어서 필수 API 키 입력

# 3. DB 실행 (Docker)
docker-compose up -d

# 4. 백엔드 실행
cd backend
./gradlew bootRun

# 5. 프론트엔드 실행
cd frontend
npm install
npm run dev
```

**접속 주소**
- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:8080
- 🗄️ **MySQL**: localhost:3306

### 환경변수 설정

| 키 | 설명 | 필수 여부 |
|---|---|:---:|
| `DB_URL` | MySQL 연결 URL | ✅ |
| `DB_USERNAME` | 데이터베이스 사용자 | ✅ |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | ✅ |
| `JWT_SECRET` | JWT 서명 키 | ✅ |
| `KAKAO_MAP_KEY` | 카카오 Maps API 키 | ✅ |
| `AWS_ACCESS_KEY` | AWS 액세스 키 | ✅ |
| `AWS_SECRET_KEY` | AWS 시크릿 키 | ✅ |
| `AWS_S3_BUCKET` | S3 버킷명 | ✅ |

---

## 🔧 트러블슈팅

<details>
<summary><b>⚡ N+1 쿼리로 인한 OOM 장애</b></summary>

**문제:** 모임 상세 조회 시 정모 목록과 참가자 조회가 중첩되어 쿼리 폭증 및 서버 다운 발생

**원인 분석:**
- `findAll()` 호출 시 연관 엔티티를 N번 추가 조회
- 트래픽 증가 시 DB 커넥션 고갈

**해결:**
```java
@EntityGraph(attributePaths = {"members", "events"})
List<Meeting> findAllWithDetails();
```
- `@EntityGraph` 및 Fetch Join 도입으로 쿼리 수를 1~2개로 감소
- 서버 안정성 확보 및 응답 속도 개선

</details>

<details>
<summary><b>🗺️ 지도 드래그 시 API 과부하</b></summary>

**문제:** 모바일 환경에서 잦은 지도 이동 시 카카오 API 호출 과부하 발생

**원인 분석:**
- 지도 이동 이벤트마다 API 호출 발생
- 짧은 시간 내 수십 번의 중복 요청

**해결:**
```javascript
const debouncedSearch = useCallback(
  debounce((bounds) => fetchMeetings(bounds), 500),
  []
);
```
- 마커 클러스터링 + Debounce 처리로 뷰포트 변경 완료 시에만 데이터 동기화
- API 호출 횟수 대폭 감소

</details>

<details>
<summary><b>💬 WebSocket 한글 깨짐 문제</b></summary>

**문제:** WebSocket 기반 채팅에서 한글 메시지 깨짐 및 데이터 불안정 발생

**원인 분석:**
- 서버 메시지 인코딩 과정에서 한글 처리 예외 누락

**해결:**
- Redis 메시지 큐 구축 및 비동기 처리 도입
- 인코딩 필터 추가 및 프론트엔드와 병행 테스트로 인터페이스 오류 최소화

</details>

---

## 👥 팀 구성 및 역할

| 이름 | 역할 | 담당 기능 |
|------|------|-----------|
| **이세종** | BE (팀장) | DB 설계, DevOps, JWT/OAuth 보안 |
| **김민규** | BE | AI 추천 알고리즘, 숏폼 데이터 최적화, 모임 CRUD |
| **방영진** | BE | WebSocket 실시간 채팅, 알림 시스템, 카카오 API 연동 |
| **박영선** | FE | 숏폼 UI, 공통 컴포넌트, 채팅 UI, 지도 연동 |
| **박유경** | FE | 카카오 맵/주소 검색, 검색 필터, 마이페이지 |

---

## 📂 프로젝트 구조

### Frontend (Feature-Sliced Design)
```
frontend/
├── features/           # 핵심 기능 단위 모듈
│   ├── auth/           # 인증
│   ├── chat/           # 채팅
│   ├── map/            # 지도
│   ├── meeting/        # 모임
│   └── recommendation/ # AI 추천
├── routes/             # 페이지 라우팅
├── shared/             # 공용 모듈 (API 클라이언트, 타입, 유틸)
├── store/              # 전역 상태 (Zustand)
└── styles/             # 전역 스타일
```

### Backend (Domain-Driven Design)
```
backend/
└── src/
    ├── domain/         # 도메인별 비즈니스 로직
    │   ├── ai/
    │   ├── chat/
    │   ├── event/
    │   ├── meeting/
    │   ├── notification/
    │   ├── recommendation/
    │   └── user/
    └── global/         # 전역 설정
        ├── config/     # Security, Swagger, WebSocket
        ├── error/      # 예외 처리
        └── secret/     # JWT, OAuth
```

---

## 🚀 향후 개선 계획

- [ ] 숏폼 영상 업로드 및 스트리밍 최적화
- [ ] 실시간 위치 공유 기능
- [ ] 모임 후기 및 평점 시스템
- [ ] PWA 전환으로 모바일 앱 경험 개선
- [ ] 다국어 지원 (글로벌 확장)

---

<div align="center">

**Made with ❤️ by Aidea Team**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/Younjin9/aidea)

</div>
