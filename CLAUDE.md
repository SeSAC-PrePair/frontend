# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

PrePair의 프론트엔드 애플리케이션으로, React 19와 Vite를 기반으로 한 AI 기반 면접 코칭 플랫폼입니다. 사용자에게 맞춤형 면접 질문을 제공하고 AI 피드백을 통해 취업 준비를 돕습니다.

## 기술 스택

- **Framework**: React 19 (React DOM 19.2.0)
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.5
- **Animation**: Framer Motion 12.23.24
- **Linting**: ESLint 9.39.1
- **Module Type**: ES Modules

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (기본 포트: 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# ESLint 실행
npm run lint
```

## 프로젝트 구조

```
src/
├── assets/              # 이미지 및 정적 파일
├── components/          # 재사용 가능한 컴포넌트
│   ├── Modal.jsx
│   ├── ContributionHeatmap.jsx
│   └── RecentPurchases.jsx
├── context/             # React Context (전역 상태 관리)
│   └── AppStateContext.jsx
├── constants/           # 상수 및 설정
│   └── onboarding.js
├── hooks/               # 커스텀 훅
│   └── useMediaQuery.js
├── layouts/             # 레이아웃 컴포넌트
│   └── AppLayout.jsx
├── pages/               # 페이지 컴포넌트
│   ├── Landing.jsx
│   ├── Auth.jsx
│   ├── SignupSuccessPage.jsx
│   ├── Coach.jsx        # AI 면접 코치 페이지
│   ├── Answer.jsx       # 질문 답변 페이지
│   ├── Settings.jsx
│   └── rewards/         # 리워드 관련 페이지
│       ├── RewardsOverview.jsx
│       ├── RewardShop.jsx
│       ├── PurchaseComplete.jsx
│       ├── PurchaseHistory.jsx
│       └── purchaseUtils.js
├── styles/              # CSS 파일 (컴포넌트별/페이지별 분리)
│   ├── base.css
│   ├── components/
│   ├── layouts/
│   └── pages/
├── App.jsx              # 라우팅 설정
├── main.jsx             # 앱 진입점
└── index.css            # 전역 스타일
```

## 아키텍처 패턴

### 상태 관리

- **Context API 기반**: `AppStateContext`를 통한 전역 상태 관리
- **주요 상태**:
  - `user`: 사용자 프로필 (이름, 이메일, 직업군, 목표, 포인트, 연속 기록)
  - `scoreHistory`: 면접 피드백 기록
  - `activity`: GitHub-style 히트맵 활동 데이터 (53주 x 7일)
  - `purchases`: 리워드 구매 내역
  - `sentQuestions`: 발송된 질문 목록
  - `currentQuestion`: 현재 활성 질문

### 주요 함수

- `login()`: 사용자 로그인 및 첫 질문 발송
- `signup()`: 회원가입 및 프로필 초기화
- `dispatchQuestion()`: 사용자 프로필 기반 면접 질문 생성 및 발송
- `recordInterviewResult()`: 답변 제출, 점수 기록, 포인트 부여
- `redeemReward()`: 포인트로 리워드 구매

### 라우팅 구조

**Public Routes** (인증 불필요):
- `/` - 랜딩 페이지
- `/auth` - 로그인/회원가입
- `/signup-success` - 회원가입 완료

**Protected Routes** (인증 필요):
- `/coach` - AI 면접 코치 (질문 연습 및 피드백)
- `/answer/:dispatchId?` - 발송된 질문 답변 페이지
- `/settings` - 사용자 설정 (직업군, 알림 채널, 질문 빈도)
- `/rewards` - 리워드 개요
- `/rewards/shop` - 리워드 상점
- `/rewards/complete` - 구매 완료
- `/rewards/history` - 구매 내역

**보호 메커니즘**: `ProtectedRoute` 컴포넌트가 사용자 인증 확인, 미인증 시 `/auth`로 리다이렉트

### 레이아웃 시스템

- **AppLayout**: 모든 페이지를 감싸는 공통 레이아웃
  - 헤더: 로고, 내비게이션, 로그인/회원가입 버튼
  - 반응형 모바일 메뉴
  - 푸터
  - 페이지 전환 애니메이션 (Framer Motion)

### 애니메이션

- **Framer Motion 사용**:
  - 페이지 전환: `initial={{ opacity: 0, y: 16 }}`
  - `AnimatePresence`로 부드러운 mount/unmount

### 질문 시스템

**직업군(Job Track)** 분류:
- `people`: 사람 중심 직업 (승무원, CS 상담원)
- `leadership`: 협업/리더십 (PM, HR)
- `creative`: 창의/논리 (마케터, 디자이너)
- `technical`: 기술/연구 (프론트엔드, 백엔드, R&D)

**질문 발송 주기(Cadence)**:
- `daily`: 평일 오전 11시 (월~금)
- `weekly`: 매주 월요일 오전 11시

**알림 채널**:
- `email`: 기본 발송 (항상 활성)
- `kakao`: 선택 알림

### 스코어링 시스템

4개 기준으로 면접 답변 평가:
1. **구조화** (25%): MECE한 논리 전개
2. **명료성** (25%): 핵심 메시지 명확성
3. **깊이** (30%): 근거, 데이터, 인사이트
4. **스토리텔링** (20%): 서사, 몰입감

**포인트 시스템**:
- 답변 제출 시 점수의 60% (최소 40점) 획득
- 중복 답변은 포인트 미지급

## 스타일링 규칙

- **CSS Modules 미사용**: 일반 CSS 파일 사용
- **파일 구조**: 컴포넌트/페이지별 CSS 파일 분리
  - `styles/components/*.css`
  - `styles/pages/*.css`
  - `styles/layouts/*.css`
- **네이밍 컨벤션**: BEM 스타일 클래스명 사용 예시:
  - `.shell`, `.shell__header`, `.shell__main`
  - `.nav__link`, `.nav__link--active`
  - `.cta-button`, `.cta-button--primary`, `.cta-button--ghost`

## ESLint 설정

- **Config Type**: Flat Config (eslint.config.js)
- **Plugins**:
  - `eslint-plugin-react-hooks` (recommended-latest)
  - `eslint-plugin-react-refresh` (Vite 통합)
- **Custom Rules**:
  - `no-unused-vars`: `motion`, 대문자 변수 무시 (`^(motion|[A-Z_])`)

## 중요 사항

1. **React 19 사용**: 최신 React 기능 활용
2. **Vite 7.x**: 빠른 HMR 및 빌드
3. **Mock 데이터**: `AppStateContext`에 하드코딩된 mock 데이터 사용 (API 통합 전)
4. **반응형 디자인**: `useMediaQuery` 훅으로 브레이크포인트 처리
5. **GitHub-style 히트맵**: 53주 x 7일 2차원 배열로 활동 추적
6. **질문 선택 로직**: 사용자 직업군/역할 기반 필터링, sequence로 순환

## 개발 시 주의사항

- **Import 경로**: 상대 경로 사용 (path alias 미설정)
- **컴포넌트 파일명**: PascalCase (`Coach.jsx`, `AppLayout.jsx`)
- **페이지 컴포넌트**: 기본 export 사용 (`export default function`)
- **상태 업데이트**: Context에서 제공하는 함수만 사용 (직접 수정 금지)
- **날짜 처리**: ISO 8601 문자열 형식 (`new Date().toISOString()`)
- **Framer Motion**: `motion as Motion`으로 import하여 ESLint 경고 회피