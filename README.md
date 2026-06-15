<div align="center">

# 📍 Aidea

### 위치 기반 숏폼 모임 매칭 플랫폼

**내 주변의 즐거움, 숏폼으로 탐색하고 관심사에 맞게 연결하세요.**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Younjin9/aidea)

</div>

---

## 📖 프로젝트 소개

**Aidea**는 위치 정보와 사용자 관심사를 활용한 추천 기능을 결합한 **하이브리드 모임 플랫폼**입니다.
기존의 텍스트 중심 모임 탐색에서 벗어나 **숏폼(Short-form)** UI를 통해 모임의 분위기를 직관적으로 파악하고,
관심사·지역·인기도·최신성을 반영한 규칙 기반 점수로 모임을 추천합니다.

### 개발 기간
**2026.01.10 ~ 2026.02.28** (약 7주)

### 프로젝트 목표
- 위치 정보 기반 모임 탐색 및 매칭 시스템 구현
- 사용자 관심사와 지역을 반영한 규칙 기반 추천 기능 구현
- WebSocket/STOMP 기반 실시간 채팅 시스템 구축
- 카카오 Maps API 연동을 통한 위치 서비스 구현

---

## ✨ 주요 기능

<table>
<tr>
<td width="50%">

### 📍 위치 기반 탐색
- 🗺️ **위치 정보 연동**
  - 모임 주소와 위도·경도 저장
  - 카카오 Maps API 연동 지도 탐색
  - 장소 검색 및 좌표 선택
- 🎬 **숏폼 UI**
  - 카드 스와이프 방식의 모임 탐색
  - 모임 분위기 영상/이미지 미리보기

</td>
<td width="50%">

### 🎯 개인화 추천
- 🧠 **개인화 추천**
  - 사용자 관심사와 모임 카테고리 매칭
  - 지역·인기도·최신성 가중치 반영
- 🎯 **스마트 매칭**
  - 항목별 점수를 합산한 규칙 기반 추천
  - 모집 중이고 정원이 남은 모임 우선 제공

</td>
</tr>
<tr>
<td width="50%">

### 💬 실시간 소통
- 📩 **실시간 채팅**
  - STOMP와 Spring Simple Broker 기반 모임별 채팅방
  - 채팅 기록 자동 저장 및 조회
- 🔐 **채팅 접근 제어**
  - STOMP 연결 단계 JWT 검증
  - 모임 가입자만 메시지 전송·조회 허용

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
  - 선택한 장소의 주소와 좌표를 모임 생성 화면에 반영

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
| **Framework** | Spring Boot 3.4 |
| **Language** | Java 17 |
| **Database** | MySQL 8.0 |
| **Token Store** | Redis |
| **Security** | Spring Security, JWT |
| **Real-time** | WebSocket, STOMP, Spring Simple Broker |
| **Recommendation** | Rule-based weighted scoring |
| **Docs** | Swagger |

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🚀 DevOps
| 분류 | 기술 스택 |
|------|----------|
| **Container** | Docker |
| **Cloud** | AWS EC2, CloudFront |
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
│  │   Auth   │  │ Meeting  │  │   Chat   │  │Recommend │        │
│  │Controller│  │Controller│  │Controller│  │Controller│        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       └─────────────┴──────────────┴──────────────┘             │
│                       Service Layer                              │
│       ┌─────────────┬──────────────┬──────────────┐             │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼──────┐       │
│  │   JPA    │  │  Redis   │  │  Kakao   │  │ Weighted  │       │
│  │Repository│  │  Token   │  │ Maps SDK │  │  Scoring  │       │
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
- **카카오 Maps API**: 키워드로 장소를 검색하고 지도에서 위치 확인
- **위치 데이터 저장**: 선택한 장소의 주소와 위도·경도를 모임 정보에 저장
- **검색 최적화**: 모임 검색어 입력에 300ms Debounce 적용

### 2. 규칙 기반 추천
- **관심사 점수**: 관심 카테고리 및 제목·설명 키워드 일치 여부 반영
- **지역 점수**: 사용자 지역과 모임 지역의 일치 여부 반영
- **복합 가중치**: 관심사 40점, 지역 30점, 인기도 20점, 최신성 10점으로 합산

### 3. 실시간 채팅 시스템
- **WebSocket/STOMP**: Spring Simple Broker를 이용한 모임별 채팅방 운영
- **접근 제어**: STOMP `CONNECT`에서 JWT를 검증하고 모임 가입 여부 확인
- **채팅 기록**: MySQL 영구 저장 및 페이지네이션 조회

### 4. 모임 참가 프로세스
- **신청 → 승인 흐름**: 참가 신청 저장 → 호스트 승인/거절 처리
- **멤버 상태 관리**: `PENDING`, `APPROVED`, `REJECTED`, `LEFT` 상태 관리
- **권한 검증**: 호스트만 참가 신청을 승인하거나 거절할 수 있도록 검증

### 5. 채팅 부하 테스트
- **k6 시나리오 자동화**: 사용자 생성부터 JWT 인증, STOMP 연결·구독·전송·수신까지 자동화
- **성능 기준 설정**: 메시지 왕복 지연 p95 1초 미만, STOMP 연결 p95 2초 미만
- **저하 구간 식별**: 300 VUs에서 왕복 p95 601ms, 350 VUs에서 1.14초로 기준 초과
- **연결 검증**: 500 VUs까지 연결 및 메시지 수신 성공률 100% 확인

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
<summary><b>💬 채팅 & 추천 API</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/chat/rooms` | 내 채팅방 목록 | ✅ |
| `GET` | `/api/chat/meetings/{mId}/messages` | 메시지 조회 | ✅ |
| `POST` | `/api/chat/rooms` | 채팅방 생성 | ✅ |
| `GET` | `/api/recommendations` | 규칙 기반 모임 추천 | ✅ |

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

---

## 🔧 트러블슈팅

<details>
<summary><b>⚡ STOMP 채팅 부하 테스트 및 병목 구간 분석</b></summary>

**목적:** 동시 접속자가 증가할 때 WebSocket 연결과 메시지 왕복 지연이 어떻게 변하는지 확인

**테스트 조건:**
- k6, 로컬 단일 머신, 단일 채팅방
- 연결 유지 40초, 사용자당 10초에 메시지 1회 전송
- 메시지 왕복 지연 p95 1초 미만을 통과 기준으로 설정

**결과:**

| 동시 접속 | 메시지 왕복 p95 | STOMP 연결 성공률 | 판정 |
|---:|---:|---:|:---:|
| 10 VUs | 26ms | 100% | 통과 |
| 50 VUs | 78ms | 100% | 통과 |
| 200 VUs | 492ms | 100% | 통과 |
| 300 VUs | 601ms | 100% | 통과 |
| 350 VUs | 1.14s | 100% | 기준 초과 |
| 400 VUs | 1.33s | 100% | 기준 초과 |
| 500 VUs | 1.82s | 100% | 기준 초과 |

**분석:**
- 500 VUs까지 연결과 메시지 수신은 모두 성공했지만 350 VUs부터 왕복 지연이 목표 기준을 초과
- 연결 자체보다 DB 저장, Spring Simple Broker의 단일 채팅방 fan-out, executor 대기열을 우선 병목 후보로 식별
- 운영 수용량이 아니라 제한된 로컬 테스트 조건에서 성능 저하가 시작되는 구간을 확인한 결과

[상세 테스트 기록](docs/chat-load-test-post.md)

</details>

<details>
<summary><b>🔎 모임 검색 중복 요청 제어</b></summary>

**문제:** 사용자가 검색어를 입력할 때마다 요청하면 불필요한 API 호출이 연속으로 발생

**해결:**
```javascript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```
- 검색어 입력에 300ms Debounce 적용
- 검색어가 비어 있을 때는 API를 호출하지 않도록 처리

</details>

<details>
<summary><b>💬 STOMP 채팅 인증 및 접근 제어</b></summary>

**문제:** HTTP 인증과 별도로 WebSocket 연결과 메시지 전송 권한을 검증해야 함

**해결:**
- STOMP `CONNECT` 프레임의 `Authorization` 헤더에서 JWT 검증
- 검증한 사용자 이메일을 WebSocket `Principal`로 설정
- 메시지 저장과 이력 조회 시 모임 가입 상태를 확인해 비가입자 접근 차단

</details>

---

## 👥 팀 구성 및 역할

| 이름 | 역할 | 담당 기능 |
|------|------|-----------|
| **이세종** | BE (팀장) | DB 설계, DevOps, JWT/OAuth 보안 |
| **김민규** | BE | 추천 기능 관련 기술 검토 및 프로젝트 환경 구성 |
| **방영진** | BE | 모임 CRUD, 참가 신청·승인·거절, 멤버 관리, STOMP 채팅, 카카오맵 장소 검색 연동, k6 부하 테스트 |
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
│   └── recommendation/ # 규칙 기반 추천
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
