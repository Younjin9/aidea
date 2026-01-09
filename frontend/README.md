
# 위치 기반 AI 모임 매칭 플랫폼

# aidea
```
프론트 구조
frontend/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── KakaoLoginButton.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useSignup.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   └── index.ts
│   │
│   └── project/
│       ├── components/
│       │   ├── ProjectList.tsx
│       │   ├── ProjectCard.tsx
│       │   └── ProjectSelector.tsx
│       ├── hooks/
│       │   ├── useProjects.ts
│       │   └── useProjectSelection.ts
│       ├── api/
│       │   └── projectApi.ts
│       ├── store/
│       │   └── projectStore.ts
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   └── layout/
│   │       ├── MainLayout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── api.ts
│   │   └── constants.ts
│   └── types/
│       ├── auth.types.ts
│       ├── project.types.ts
│       ├── common.types.ts
│       └── api.types.ts
│
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ProjectListPage.tsx
│   └── index.ts
│
├── App.routes.tsx
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```
