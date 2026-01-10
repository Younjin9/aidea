# 📅 AIMO 프론트엔드 개발 작업 일지

## 2026-01-09 (목)

### 1. 프로젝트 구조 및 역할 분담 확정

#### 👥 역할 분담
| 담당자 | 담당 영역 (Features & Pages) | 상세 내용 |
| :--- | :--- | :--- |
| **박영선 (나)** | **로그인/인증** (Auth) | 로그인, 회원가입, ID/PW 찾기 |
| | **AI 추천** (Recommendation) | Shorts(추천) 탭, 스와이프 인터페이스 |
| | **채팅** (Chat) | 채팅 목록, 채팅방, 메시지 전송 |
| | **공통 UI** | 탭바, 태그, 버튼, 인풋 |
| **박유경** | **모임** (Meeting) | 모임 목록, 검색, 상세 페이지 |
| | **마이페이지** (Profile) | 프로필 조회/수정, 내 활동 내역 |
| | **공통 UI** | 모임 카드, 프로필 이미지, 모달 |

#### 📂 폴더 구조 개편 (Feature-Sliced Design 적용)
협업 효율을 위해 프로젝트 구조를 기능 단위로 세분화하여 폴더링 완료
*   `src/features/` : auth, chat, meeting, onboarding, profile, recommendation, map
*   `src/shared/` : api, types, components(ui, layout), hooks, utils, config
*   `src/pages/` : 각 기능별 라우팅 페이지

### 2. 주요 작업 내용

#### 🛠️ 공통 레이아웃 및 네비게이션
*   **하단 탭바 (BottomNavigation) 재구성**
    *   **메뉴 구성**: Shorts / 모임 / 채팅 / 마이 (4탭 체제)
    *   **아이콘 변경**: 직관적인 아이콘(Film, Users, MessageCircle, User)으로 교체
    *   **경로 매핑**: `/shorts`, `/meetings`, `/chat`, `/mypage`

#### 🚦 라우팅 (AppRoutes)
*   `/chat` 경로 추가 및 `ChatListPage` 연결
*   메인 레이아웃(`MainLayout`)에 채팅 탭 포함되도록 설정

#### 📄 페이지 생성
*   `src/pages/chat/ChatListPage.tsx` : 채팅 목록 탭 진입을 위한 기본 페이지 생성

### 3. 향후 계획 (Next Steps)
1.  **[영선]** 로그인/회원가입 기능 구현 (`features/auth`)
2.  **[영선]** AI 추천(Shorts) UI 구현 (`features/recommendation`)
3.  **[유경]** 모임 목록 UI 및 데이터 연동 (`features/meeting`)
4.  **[공통]** `shared/components/ui` 내 공통 컴포넌트(태그, 모달, 아바타 등) 개발
