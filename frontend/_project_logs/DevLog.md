# 📅 AIMO 프론트엔드 개발 작업 일지 (Detailed Log)

> **Last Updated**: 2026-01-23
> **Status**: 기능 개발 및 통합 단계 (v0.2.0)
> **Description**: 프로젝트 세팅부터 현재 상태까지의 상세 기록

## 1. 🏗️ 프로젝트 초기 설정 (Initialization)

### 🛠️ 기술 스택 (Tech Stack)
*   **Core**: React 19.2.0, TypeScript ~5.9.3, Vite 7.2.4
*   **Styling**: Tailwind CSS 4.0.0, `clsx`, `tailwind-merge`
*   **State Management**: Zustand 5.0.9 (Global), TanStack Query 5.90.12 (Server)
*   **Routing**: React Router DOM 7.10.1
*   **Tools**: Monaco Editor, Axios, WebSocket, ESLint 9.39.1

## 2. 💻 기능 구현 상세 (Implementation Details)

### 🔧 Git 작업 환경 구축 및 충돌 해결 (2026-01-09)
*   **Repository 연결**: 로컬 `frontend/youngsun` 브랜치와 원격 `origin` 연결 완료.
*   **Merge 작업**: 동료(yukyung) 브랜치와 병합 수행.
*   **UI 개선**: `AuthLayout.tsx` 중앙 정렬 스타일 적용.

### 2026-01-23 (채팅 기능 개발 및 통합)

### 12. 💬 실시간 채팅 기능 구현 (Chat Feature)
*   **채팅방 UI 구현 (`ChatRoomPage.tsx`)**:
    *   **모바일 최적화**: `absolute inset-0` 레이아웃을 사용하여 상단 헤더, 메시지 영역, 하단 입력창 구조 완성.
    *   **입력창 고정**: `sticky`에서 `absolute` & `flex` 컬럼 레이아웃으로 변경하여 **입력바가 항상 하단에 고정**되도록 수정.
    *   **메시지 UI**: '나'와 '상대방'의 말풍선 스타일 분리, 시간 표시, 읽음 확인 로직 UI 적용.
    *   **한글 입력 버그 해결**: `isComposing` 상태 관리로 IME 입력 중 엔터 키 중복 전송 방지.
*   **API 연동**:
    *   `useQuery`로 메시지 목록 조회 (`messageApi.getMessages`).
    *   `useMutation`으로 메시지 읽음 처리 (`messageApi.markAsRead`) 및 전송 (`WebSocket` or API).
    *   **Optimistic UI**: 메시지 전송 시 즉시 화면에 반영하여 빠른 사용자 경험 제공.

### 13. 🔄 모임 상세 페이지 통합 (Feature Integration)
*   **모임 상세 정보 + 채팅 탭 통합**:
    *   `MeetingDetailPage.tsx` 수정하여 **'홈'**, **'채팅'** 탭 인터페이스 구현.
    *   채팅 탭 활성화 시 `ChatRoomPage` 컴포넌트를 렌더링하도록 통합.
    *   스크롤 컨텍스트 분리: '홈' 탭은 메인 스크롤, '채팅' 탭은 내부 스크롤 사용 (`overflow-hidden` 제어).

### 14. ⚔️ Git 충돌 해결 및 푸시 (Conflict Resolution)
*   **상황**: `frontend-integration` 브랜치와 병합 시 `MeetingDetailPage.tsx`, `AppRoutes.tsx` 등에서 대규모 충돌 발생.
*   **해결**:
    *   **`MeetingDetailPage.tsx`**: 통합 브랜치의 최신 헤더 UI/API 로직과 채팅 탭 기능을 병합.
    *   **`AppRoutes.tsx`**: 이벤트 수정/생성 라우트와 채팅 라우트 병합.
    *   **`MyPage` 관련**: 팀원의 최신 API 로직(`useMyPage.ts`)을 우선 적용(`--theirs`)하여 에러 방지.
*   **결과**: 안전하게 병합 후 `frontend/youngsun`에 푸시 완료.

### 2026-01-26 (화이트 스크린 오류 수정 및 빌드 안정화)

### 15. 🐛 Build Error & White Screen Fix (Bug Fix)
*   **현상**: 앱 실행 시 화이트 스크린 발생 (렌더링 중단). `npm run dev`에서는 경고로 떴으나 실제 런타임에서 Crash 발생.
*   **원인 분석**: `npm run build`를 통해 숨겨진 TypeScript 타입 불일치 및 API 요청 필드 오류 다수 확인.
*   **조치 내용**:
    *   **`ChatRoomPage.tsx`**: Optimistic Update 시 `ChatMessage` 타입의 필수 필드인 `type: 'TALK'` 누락 수정.
    *   **`EventCreate/EditPage.tsx`**: API 요청 타입(`CreateEventRequest`)에 없는 `cost` 필드 제거.
    *   **`MeetingDetailPage.tsx`**: `userId` 타입 불일치(number vs string) 해결 및 `joinMeetingApi` 요청 시 `message` 필드를 `requestMessage`로 수정.
    *   **`useMembers.ts`**: `transferHost` API 호출 시 파라미터명 오류(`newHostId` -> `newHostUserId`) 수정.
    *   **Cleanup**: 미사용 변수(`navigate`, `useQueryClient` 등) 제거.
*   **결과**: 빌드 성공 및 로컬 개발 서버(Port 5174) 정상 구동 확인.

### 2026-01-28 (백엔드 연동 및 회원가입 버그 수정)

### 15. 🔌 백엔드 및 환경 설정 (Backend & Env Setup)
*   **서버 구동**: `docker-compose` 환경 변수(`JWT_SECRET`, DB Credentials) 설정 및 `SPRING_JPA_HIBERNATE_DDL_AUTO=update`로 스키마 오류 해결.
*   **포트/CORS**:
    *   Vite 포트 충돌(Port 5173 사용 중) 해결 및 프로세스 정리.
    *   Backend `SecurityConfig.java`: `http://localhost:*` 패턴 허용으로 CORS 차단 문제 해결.

### 16. 🐛 회원가입(닉네임 중복 확인) API 수정 (Bug Fix)
*   **증상**: `/api/users/nickname-check` 호출 시 `500 Internal Server Error` (JSON Parse Error).
*   **원인**: 프론트엔드 API 타입 정의(`boolean` 기대)와 백엔드 실제 응답(`{ available: boolean, message: string }`) 불일치.
*   **해결**:
    *   `auth.types.ts`: `NicknameCheckResult` 인터페이스 추가.
    *   `authApi.ts`: 응답 타입을 `BaseResponse<NicknameCheckResult>`로 수정.
    *   `SignupPage.tsx`: `response.data.available` 필드를 확인하도록 로직 변경.
*   **결과**: 회원가입 시 닉네임 중복 체크 정상 동작 확인.

### 17. 💾 버전 관리 (Version Control)
*   백엔드 CORS 설정 및 프론트엔드 API 수정 사항 커밋 (`Fix nickname check API errors`).
*   `frontend/youngsun` 브랜치 푸시 완료.

### 2026-01-31 (통합 브랜치 병합 및 빌드 안정화)

### 18. 🔄 통합 브랜치(frontend-integration) 병합 (Integration)
*   **작업 내용**: 기능 통합 브랜치인 `frontend-integration`을 로컬 `frontend/youngsun`으로 병합.
*   **충돌 해결 (Conflict Resolution)**:
    *   `src/features/auth/components/OAuthCallbackPage.tsx`: 필수 정보 입력(`RequiredInfoPage`) 플로우 통합.
    *   `src/features/auth/hooks/useLogin.ts`: `useAuthStore` 훅과의 연동 로직 병합.
    *   `src/features/chat/components/ChatRoomPage.tsx`: UI 수정 사항 병합.
    *   `src/features/mypage/components/MyPageView.tsx`: 프로필 이미지 처리 로직 병합.
    *   `src/routes/AppRoutes.tsx`: 신규 라우트(`RequiredInfoPage`) 추가 및 기존 라우트 유지.

### 19. 🛠️ 빌드 오류 및 환경 변수 수정 (Bug Fixes)
*   **Build Error Fixes**:
    *   `ChatRoomPage.tsx`: 닫는 중괄호(`}`) 누락 등 문법 오류 수정.
    *   `RequiredInfoPage.tsx`: `gender` 등 누락된 Props 타입 에러 해결.
    *   `Modal` 컴포넌트: `isOpen` -> `open` 등 Props 네이밍 불일치 수정.
*   **Environment Config**: `.env`의 `VITE_KAKAO_APP_KEY`를 `VITE_KAKAO_MAP_API_KEY`로 수정하여 `vite.config.ts` 설정과 통일.
*   **Module Resolution**: `AppRoutes.tsx`에서 `@/features/...` Alias 경로 인식 실패 문제 → `../features/...` 상대 경로로 수정하여 해결.

### 20. 🚀 최종 배포 준비 (Final Check)
*   **Build Status**: `npm run build` 성공 (TypeScript Check Pass).
*   **Push**: 수정 사항 `frontend/youngsun` 브랜치에 푸시 완료.

### 2026-02-01 (무한 스크롤 및 로컬 테스트 환경 구성, 최종 배포 준비)

### 21. 🎬 Shorts(모임 추천) 무한 스크롤 구현
*   **기능**: `ShortsFeed`에서 스크롤을 내리면 자동으로 다음 목록을 불러오도록 개선.
*   **구현**:
    *   `useInfiniteMeetings` Hook 추가 (TanStack `useInfiniteQuery` 활용).
    *   **Intersection Observer**를 도입하여 마지막 카드가 50% 정도 보일 때 `fetchNextPage` 트리거.

### 22. 🛠️ 백엔드 연동 예외 처리 (테스트 후 원복 완료)
*   **배경**: 백엔드 서버가 꺼져 있을 때 퍼블리싱/UI 로직 테스트를 위해 임시로 Mock Data와 Bypass 로직을 추가했었음.
*   **조치**: `frontend/youngsun` 브랜치 푸시 및 백엔드 통합을 위해 테스트용 코드(Mock Data, Exception Bypass)를 모두 제거하고 **실제 API 호출 코드(`meetingApi`, `authApi`)로 원복**함.

### 23. 🐛 화이트 스크린 이슈 해결 (RequiredInfoPage)
*   **원인**: `useEffect` 내에서 `user` 상태 변경 시 무한 리렌더링 발생 (Zustand Selector 사용 미숙).
*   **해결**: `useRef`(`isInitialized`)를 도입하여 초기 데이터 로딩을 **최초 1회**로 제한하고, Selector를 분리하여 최적화함.

### 24. 🔄 최신 코드 병합 (Sync)
*   `origin/develop` 및 `origin/frontend-integration` 브랜치 병합 완료.
*   충돌 없이 최신 로직(좋아요 동기화, 모임 상세 등)과 나의 작업물(Shorts, Onboarding Fix) 통합.

---

## 5. 🔜 향후 계획 (Next Steps)
1.  **[WebSocket]** 실제 백엔드 소켓 연결 테스트 및 프로토콜 조율.
2.  **[Refactor]** `BottomNavigation`의 기획 변경(3탭: Shorts/모임목록/MyPage)에 맞춰 수정.
3.  **[Meeting]** 모임 생성/수정 로직 검증.
