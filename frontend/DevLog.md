# 📅 AIMO 프론트엔드 개발 작업 일지 (Detailed Log)

> **Last Updated**: 2026-01-09
> **Status**: 초기 구현 단계 (v0.1.0)
> **Description**: 프로젝트 세팅부터 현재 상태까지의 상세 기록

## 1. 🏗️ 프로젝트 초기 설정 (Initialization)

### 🛠️ 기술 스택 (Tech Stack)
*   **Core**: React 19.2.0, TypeScript ~5.9.3, Vite 7.2.4
*   **Styling**: Tailwind CSS 4.0.0, `clsx`, `tailwind-merge`
*   **State Management**: Zustand 5.0.9 (Global), TanStack Query 5.90.12 (Server)
*   **Routing**: React Router DOM 7.10.1
*   **Tools**: Monaco Editor, Axios, WebSocket, ESLint 9.39.1

### 📂 아키텍처: Feature-Sliced Design (FSD)
*   소스 코드 구조를 도메인(Feature)과 공통(Shared)으로 명확히 분리하여 유지보수성 확보.
*   **`src/features/`**: (auth, chat, meeting, onboarding, profile, recommendation, map)
*   **`src/shared/`**: (components, hooks, types, utils, config, api)
*   **`src/pages/`**: 라우팅 단위 페이지 (각 feature의 컴포넌트 조합)

---

## 2. 👥 팀 역할 분담 (R&R)

### Frontend Team
| 담당자 | Feature (도메인 기능) | Shared Components (공통 UI) |
| :--- | :--- | :--- |
| **박영선 (나)** | **로그인, AI 추천, 채팅**<br/>(Auth, Recommendation, Chat) | **취미 태그(Chip), 탭바(BottomNavigation), 버튼(Button), 인풋(Input)** |
| **박유경** | **모임, 마이페이지**<br/>(Meeting, Profile) | **모임 카드(MeetingCard), 프로필 이미지(Avatar), 모달(Modal)** |

---

## 3. 📱 UX/UI 및 디자인 시스템

### 🚦 라우팅 및 네비게이션 전략
*   **Mobile First**: `MainLayout`에 `max-w-[430px]` 및 중앙 정렬 적용하여 모바일 앱 경험 제공.
*   **Bottom Navigation (3 Tabs)**:
    1.  **Shorts**: 모임 추천 피드 (홈) - `Search` (돋보기 아이콘)
    2.  **모임목록**: 모임 검색 및 리스트 - `AlignJustify` (리스트 아이콘)
    3.  **MyPage**: 내 정보 - `User` (사람 아이콘)
    *   *(기존 4탭에서 3탭으로 간소화 결정 및 `BottomNavigation.tsx` 업데이트 예정)*

### 🎨 디자인 규칙
*   **Primary System**: 카카오 로그인(#FB7736), 메인 포인트(#F11958)
*   **Layout**: 상단 헤더 대신 컨텐츠 중심 UI, 하단 탭바 고정.

---

## 4. 💻 기능 구현 상세 (Implementation Details)

### 🔐 [Auth] 인증 시스템
*   **로그인 페이지 (`LoginPage`)**:
    *   카카오 로그인 우선 유도 (노란색 버튼, Lucide Icon).
    *   이메일 로그인/회원가입은 서브 옵션으로 제공.
*   **인증 레이아웃 (`AuthLayout`)**: 로그인/회원가입/찾기 페이지 공통 래퍼.

### 🎬 [Recommendation] Shorts (AI 추천)
*   **쇼츠 페이지 (`ShortsPage`)**:
    *   `snap-y snap-mandatory` CSS 속성을 활용한 틱톡 스타일 수직 스크롤.
    *   Mock Data 기반의 `MOCK_MEETINGS` 렌더링.
*   **추천 카드 (`RecommendedMeetingCard`)**:
    *   **배경**: 모임 이미지 풀스크린, 블러 처리 및 오버레이 그라데이션 적용.
    *   **정보**: 타이틀, 위치, 카테고리 칩, 좋아요 버튼(Heart) 오버레이 표시.

### 🚀 [Onboarding] 온보딩
*   **관심사 선택 (`InterestPage`)**:
    *   다중 선택 가능한 칩 UI 구현.
    *   선택 완료 시 `/shorts`로 자동 이동하는 플로우 연결.

### 🧩 [Shared] 공통 컴포넌트
*   **`BottomNavigation`**: `NavLink`를 사용하여 활성 탭 하이라이팅 및 라우팅 처리 (현재 코드 4탭 -> 3탭 수정 필요).
*   **`Button`**: `variant` (primary/secondary/ghost) 및 `size` prop 지원.
*   **`Input`**: 공통 스타일이 적용된 Form Input.

---

## 5. 📝 향후 계획 (Next Steps)
1.  **[Refactor]** `BottomNavigation`을 기획 변경(3탭: Shorts/모임목록/MyPage)에 맞춰 수정.
2.  **[Auth]** 카카오 로그인 API 연동 및 토큰 처리 로직 구현.
3.  **[Chat]** 채팅방 목록 및 채팅 UI 퍼블리싱 (박영선 담당).
4.  **[Meeting]** 모임 상세 페이지 및 필터링 UI (박유경 담당 지원).
