# 📘 AIMO 프로젝트 상세 가이드 & 레퍼런스

## 1. 👥 R&R (역할 분담) 및 담당 컴포넌트

### 👩‍💻 박영선 (나)
**[ 핵심 담당 기능 ]**
1.  **🔐 로그인/인증 (Auth)**
    *   로그인 (`LoginPage`), 이메일 로그인 (`EmailLoginPage`)
    *   회원가입 (`SignupPage`), 아이디/비밀번호 찾기
    *   **구현 예정**: 카카오 로그인 (`KakaoLoginButton`), 유효성 검사, 토큰 관리
2.  **🎬 AI 추천 (Recommendation)**
    *   `ShortsPage` (메인 홈): 틱톡/릴스 형태의 스와이프 UX
    *   추천 알고리즘 기반 모임 카드 노출
3.  **💬 채팅 (Chat)**
    *   `ChatListPage`: 참여 중인 채팅방 목록
    *   `ChatRoomPage`: 실시간 메시지 전송, 소켓 연결
    *   **주의**: 하단 탭에 새로 추가됨 (`/chat`)

**[ 담당 공통 컴포넌트 ]**
*   **`Tag.tsx`** (취미/카테고리 태그): `variant` props로 색상 구분 (Mint, Purple 등)
*   **`Tabs.tsx`** (페이지 내 탭): 상단 탭바 (예: 최신순/인기순), 슬라이딩 애니메이션
*   **`Button.tsx`** (완료): Primary(Hot Pink), Secondary, Outline, Ghost, FullWidth 옵션
*   **`Input.tsx`** (완료): Label, Error Message, RightElement(아이콘) 포함

---

### 👩‍💻 박유경
**[ 핵심 담당 기능 ]**
1.  **👥 모임 (Meeting)**
    *   `MeetingListPage`: 모임 목록, 필터링(지역/카테고리), 검색
    *   `MeetingDetailPage`: 모임 상세 정보, 참여하기 버튼
2.  **👤 마이페이지 (Profile)**
    *   `MyPage`: 프로필 조회, 내 모임 관리
    *   프로필 수정, 관심사 변경

**[ 담당 공통 컴포넌트 ]**
*   **`MeetingItem.tsx`**: 모임 목록용 카드 컴포넌트 (썸네일, 제목, 태그, 인원)
*   **`Avatar.tsx`**: 프로필 이미지 (이미지 로드 실패 시 기본 아이콘 처리가 중요)
*   **`Modal.tsx`**: 공통 팝업 (Overlay + Content 구조, Portal 사용 권장)

---

## 2. 🎨 디자인 시스템 (Design System)

### 🌈 색상 팔레트 (Tailwind Config)
*   **Primary (Hot Pink)**: `#F11958` (메인 버튼, 활성 상태, 강조)
*   **Secondary (Orange)**: `#FB7736` (서브 버튼, 위치 표시)
*   **Mint**: `#6FE0CE` (카테고리/취미 태그)
*   **Purple**: `#B63E93` (인원수 정보 등)
*   **Gray Dark**: `#1F1F1F` (본문 텍스트)
*   **Gray Light**: `#B7B7B7` (플레이스홀더, 비활성 텍스트)
*   **White**: `#FFFFFF`

### 📏 레이아웃 규칙
*   **모바일 뷰포트**: `max-w-[430px]` (중앙 정렬, 그림자 처리)
*   **하단 탭바 높이**: `h-[60px]`, `fixed bottom-0`
*   **스크롤바**: `no-scrollbar` 유틸리티 클래스 사용 (숨김 처리)

---

## 3. 📂 폴더 구조 및 파일 명명 규칙 (Feature-Sliced Design)

프로젝트는 **기능(Feature)** 단위로 응집도 높게 구성합니다.

```
frontend/src/
├── features/                          # 📦 기능별 모듈 (비즈니스 로직 + 전용 UI)
│   ├── auth/                          # [인증]
│   │   ├── components/                # (LoginForm, SignupForm, AuthLayout...)
│   │   ├── hooks/                     # (useAuth, useLogin...)
│   │   └── index.ts
│   ├── communication/                 # [채팅/알림] (채팅은 chat 폴더로 분리됨)
│   ├── chat/                          # [채팅]
│   │   ├── components/                # (ChatRoomList, ChatMessage, ChatInput...)
│   │   ├── hooks/                     # (useChatRooms, useMessages, useWebSocket...)
│   │   └── index.ts
│   ├── meeting/                       # [모임]
│   │   ├── components/                # (MeetingList, MeetingCard, MeetingFilter...)
│   │   ├── hooks/                     # (useMeetings, useMeetingDetail...)
│   │   └── index.ts
│   ├── onboarding/                    # [온보딩] InterestSelection 등
│   ├── profile/                       # [프로필] ProfileView, MyMeetings 등
│   ├── recommendation/                # [추천] RecommendedMeetings, ShortsFeed 등
│   └── map/                           # [지도] KakaoMap, LocationPicker 등
│
├── shared/                            # 🔗 공통 모듈 (앱 전체에서 재사용)
│   ├── api/                           # (auth.api.ts, meeting.api.ts, client.ts...)
│   ├── components/
│   │   ├── ui/                        # 디자인 컴포넌트 (Button, Input, Modal, Chip...)
│   │   └── layout/                        # 레이아웃 (MainLayout, BottomNavigation...)
│   ├── config/                        # (queryClient.ts, constants.ts...)
│   ├── hooks/                         # (useDebounce, useInfiniteScroll...)
│   ├── types/                         # (auth.types.ts, meeting.types.ts...)
│   └── utils/                         # (date.ts, validation.ts...)
│
├── pages/                             # 📄 라우팅 페이지 (Feature 컴포넌트 조합)
│   ├── auth/                          # (LoginPage, SignupPage...)
│   ├── chat/                          # (ChatListPage, ChatRoomPage)
│   ├── meeting/                       # (MeetingListPage, MeetingDetailPage...)
│   ├── mypage/                        # (MyPage...)
│   ├── recommendation/                # (ShortsPage...)
│   └── onboarding/                    # (InterestPage...)
│
├── routes/                            # (AppRoutes.tsx - 라우팅 설정)
└── store/                             # (Zustand 전역 상태 - authStore, userStore...)
```

---

## 4. 🧭 네비게이션 구조 (AppRoutes)

### 📱 하단 탭바 (Bottom Navigation)
`MainLayout`에 포함되며 항상 하단에 고정됩니다.

| 순서 | 탭 이름 | 경로 | 아이콘 | 담당 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Shorts** | `/shorts` | `Film` (🎬) | 박영선 |
| 2 | **모임** | `/meetings` | `Users` (👥) | 박유경 |
| 3 | **채팅** | `/chat` | `MessageCircle` (💬) | 박영선 |
| 4 | **마이** | `/mypage` | `User` (👤) | 박유경 |

### 🚫 탭바 없는 페이지 (MobileLayout)
`MobileLayout`만 사용하며, 뒤로가기 버튼이 주로 사용됩니다.
*   로그인/회원가입 (`/login`, `/signup`...)
*   온보딩 (`/onboarding/...`)
*   채팅방 상세 (`/chat/:roomId`) - *추후 구현 시 결정*
*   모임 상세 (`/meetings/:id`) - *추후 구현 시 결정*

---

## 5. ✅ 작업 체크포인트

### 📅 2026-01-09 (초기 세팅 완료)
*   [x] 기본 프로젝트 구조 생성 (Vite + React + TS)
*   [x] Tailwind CSS 설정 및 컬러변수 등록
*   [x] 폴더 구조(Feature-Sliced) 생성
*   [x] 기본 라우팅 및 하단 탭바 구현 (`/chat` 포함 4탭)
*   [x] `Button.tsx`, `Input.tsx` 구현 완료
