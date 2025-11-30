# 환경 변수 설정 가이드

## 📝 개요

이 프로젝트는 Vite를 사용하므로, 환경 변수는 `VITE_` 접두사가 필요합니다.
PWA 빌드 시 환경 변수는 빌드 시점에 번들에 포함됩니다.

## 🔧 설정 방법

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# .env 파일 예시
VITE_API_BASE_URL=https://prepair.wisoft.dev
VITE_WORKNET_AUTH_KEY=your_worknet_api_key_here
VITE_APP_ENV=development
```

### 2. 환경별 설정

#### 개발 환경 (`.env.development`)
```bash
VITE_API_BASE_URL=https://prepair.wisoft.dev
VITE_APP_ENV=development
```

#### 프로덕션 환경 (`.env.production`)
```bash
VITE_API_BASE_URL=https://prepair.wisoft.dev
VITE_APP_ENV=production
```

## 📋 현재 사용 중인 환경 변수

### `VITE_WORKNET_AUTH_KEY`
- **용도**: 워크넷 오픈 API 인증키
- **필수 여부**: 워크넷 API 사용 시 필요
- **위치**: `src/utils/worknetApi.js`
- **설정 방법**: 
  - 워크넷 오픈 API 페이지 (https://www.work.go.kr/openApi/openApiPage.do)에서 발급

## 🔒 보안 주의사항

### ✅ .gitignore에 포함됨
`.env` 파일은 이미 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### ⚠️ 중요!
- **절대 `.env` 파일을 Git에 커밋하지 마세요**
- 환경 변수에 민감한 정보(API 키, 비밀키 등)가 포함되어 있습니다
- 팀원과 공유할 때는 `.env.example` 파일을 사용하세요

## 🚀 PWA 빌드 시 환경 변수 처리

### 빌드 시점에 값이 고정됨

Vite는 빌드 시점에 환경 변수를 번들에 포함시킵니다.
따라서 **빌드할 때마다 올바른 환경 변수가 설정되어 있어야 합니다**.

### 빌드 명령어

```bash
# 개발 환경으로 빌드
npm run build

# 프로덕션 환경으로 빌드
# .env.production 파일이 자동으로 사용됩니다
VITE_API_BASE_URL=https://prod-api.example.com npm run build
```

### 환경 변수 확인

코드에서 환경 변수를 사용할 때:

```javascript
// ✅ 올바른 방법
const apiUrl = import.meta.env.VITE_API_BASE_URL

// ❌ 잘못된 방법 (작동하지 않음)
const apiUrl = process.env.VITE_API_BASE_URL
```

## 🔄 API URL을 환경 변수로 관리하기

현재 API URL이 하드코딩되어 있습니다. 환경 변수로 관리하려면:

### 1. 환경 변수 추가

`.env` 파일에 추가:
```bash
VITE_API_BASE_URL=https://prepair.wisoft.dev
```

### 2. 코드 수정 예시

`vite.config.js`에서:
```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prepair.wisoft.dev'

export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: apiBaseUrl,
        // ...
      }
    }
  }
})
```

> ⚠️ **주의**: `vite.config.js`는 Node.js 환경에서 실행되므로 `import.meta.env` 대신 `process.env`를 사용해야 할 수 있습니다.

## 📝 .env 파일 예시

프로젝트 루트에 `.env` 파일을 만들고 다음 내용을 추가하세요:

```bash
# API 서버 URL
# 프로덕션 빌드에서 사용됩니다
VITE_API_BASE_URL=https://prepair.wisoft.dev

# 워크넷 오픈 API 인증키
# 워크넷 API를 사용하는 경우에만 필요합니다
VITE_WORKNET_AUTH_KEY=your_worknet_api_key_here

# 앱 환경
VITE_APP_ENV=development
```

## 🛠️ 문제 해결

### 환경 변수가 적용되지 않을 때

1. **서버 재시작**
   ```bash
   # 개발 서버를 중지하고 다시 시작
   npm run dev
   ```

2. **빌드 캐시 클리어**
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   npm run build
   ```

3. **환경 변수 이름 확인**
   - 반드시 `VITE_` 접두사가 있어야 합니다
   - 대소문자를 정확히 입력했는지 확인

4. **.env 파일 위치 확인**
   - 프로젝트 루트 디렉토리에 있어야 합니다
   - `package.json`과 같은 위치

### 빌드 시 환경 변수 확인

```javascript
// 개발 중 확인
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('모든 환경 변수:', import.meta.env)
```

## 📚 참고 자료

- [Vite 환경 변수 문서](https://vitejs.dev/guide/env-and-mode.html)
- [Vite 환경 변수와 모드](https://vitejs.dev/guide/env-and-mode.html#env-files)





