# 🔧 Shared (공통 컴포넌트 및 유틸리티)

## 담당자: 박영선

### 담당 기능
- 공통 UI 컴포넌트 (Button, Input, Modal, Loading)
- 공통 레이아웃 (MainLayout, Header, Sidebar)
- 공통 훅 (useDebounce, useLocalStorage, useTheme)
- API 클라이언트 설정 (Axios 인스턴스)
- 공통 타입 정의

### 주요 파일

#### Components
- `components/ui/Button.tsx` - 공통 버튼
- `components/ui/Input.tsx` - 공통 입력
- `components/ui/Modal.tsx` - 공통 모달
- `components/ui/Loading.tsx` - 로딩 스피너
- `components/layout/MainLayout.tsx` - 메인 레이아웃
- `components/layout/Header.tsx` - 헤더
- `components/layout/Sidebar.tsx` - 사이드바

#### Hooks
- `hooks/useDebounce.ts` - 디바운스 훅
- `hooks/useLocalStorage.ts` - 로컬스토리지 훅
- `hooks/useTheme.ts` - 테마 훅

#### Utils
- `utils/api.ts` - ⭐ Axios 인스턴스 설정 (JWT 토큰 자동 추가)
- `utils/constants.ts` - 상수 정의

#### Types
- `types/auth.types.ts` - 인증 관련 타입
- `types/project.types.ts` - 프로젝트 관련 타입
- `types/common.types.ts` - 공통 타입
- `types/api.types.ts` - API 관련 타입
