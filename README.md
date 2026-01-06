
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

## 백엔드 구조 (Spring Boot)

```
backend/src/main/java/com/aidea/
├── backend/
│   ├── domain/                      # 도메인별 비즈니스 로직
│   │   ├── user/                    # 사용자 도메인
│   │   │   ├── controller/          # UserController
│   │   │   ├── service/             # UserService
│   │   │   ├── repository/          # UserRepository
│   │   │   └── entity/              # User Entity
│   │   │
│   │   ├── meeting/                 # 모임 도메인
│   │   │   ├── controller/          # MeetingController
│   │   │   ├── service/             # MeetingService
│   │   │   ├── repository/          # MeetingRepository
│   │   │   └── entity/              # Meeting Entity
│   │   │
│   │   ├── chat/                    # 채팅 도메인
│   │   │   ├── controller/          # ChatController
│   │   │   ├── service/             # ChatService
│   │   │   ├── repository/          # ChatRepository
│   │   │   └── entity/              # ChatMessage Entity
│   │   │
│   │   ├── ai/                      # AI 추천 도메인
│   │   │   ├── controller/          # AIController
│   │   │   └── service/             # AIService
│   │   │
│   │   ├── review/                  # 리뷰 도메인
│   │   │   ├── controller/          # ReviewController
│   │   │   ├── service/             # ReviewService
│   │   │   ├── repository/          # ReviewRepository
│   │   │   └── entity/              # Review Entity
│   │   │
│   │   └── safety/                  # 안전 도메인
│   │       ├── controller/          # SafetyController
│   │       ├── service/             # SafetyService
│   │       ├── repository/          # SafetyRepository
│   │       └── entity/              # Safety Entity
│   │
│   └── global/                      # 전역 설정 및 공통 기능
│       ├── config/                  # 설정 파일 (Security, JPA, etc.)
│       └── error/                   # 전역 에러 핸들링
│
└── resources/
    ├── application.yml              # 애플리케이션 설정
    └── application-*.yml            # 환경별 설정 (dev, prod)
```

