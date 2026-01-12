# 🔐 Auth Feature

## 담당자: 박영선

### 담당 기능
- 로그인/회원가입 UI
- 카카오 간편 로그인
- 인증 상태 관리
- 토큰 관리

### 주요 파일
- `components/LoginForm.tsx` - 로그인 폼
- `components/SignupForm.tsx` - 회원가입 폼
- `components/KakaoLoginButton.tsx` - 카카오 로그인 버튼
- `components/AuthLayout.tsx` - 인증 레이아웃
- `hooks/useAuth.ts` - 인증 훅
- `hooks/useLogin.ts` - 로그인 훅
- `hooks/useSignup.ts` - 회원가입 훅
- `api/authApi.ts` - 인증 API 호출
- `store/authStore.ts` - 인증 상태 관리 (Zustand)
