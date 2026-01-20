# 모바일에서 PWA 테스트 가이드

## 📱 방법 1: 개발 모드에서 테스트 (로컬 네트워크)

### 1단계: 개발 서버 실행
```bash
npm run dev
```

### 2단계: 같은 Wi-Fi 네트워크 확인
- 컴퓨터와 모바일 기기가 같은 Wi-Fi에 연결되어 있어야 합니다

### 3단계: 모바일 브라우저에서 접속
현재 IP 주소: **192.168.219.104**

모바일에서 접속:
```
http://192.168.219.104:5174
```

> ⚠️ **주의**: `localhost`는 모바일에서 접근할 수 없습니다. IP 주소를 사용해야 합니다.

### 4단계: PWA 설치 확인

#### iOS (Safari)
1. Safari에서 페이지 열기
2. 하단 공유 버튼(네모와 화살표) 탭
3. **"홈 화면에 추가"** 선택
4. 홈 화면에서 앱 아이콘 확인

#### Android (Chrome)
1. Chrome에서 페이지 열기
2. 오른쪽 상단 메뉴(⋮) 탭
3. **"홈 화면에 추가"** 또는 **"앱 설치"** 선택
4. 설치 확인 팝업에서 **"설치"** 탭

---

## 📱 방법 2: 프로덕션 빌드로 테스트 (권장)

### 1단계: 프로덕션 빌드 생성
```bash
npm run build
```

### 2단계: Preview 서버 실행
```bash
npm run preview -- --host 0.0.0.0
```

기본 포트는 4173입니다. 다른 포트를 사용하려면:
```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

### 3단계: 모바일에서 접속
```
http://192.168.219.104:4173
```

### 4단계: PWA 기능 테스트
- ✅ 홈 화면에 추가
- ✅ 오프라인 모드 동작
- ✅ 앱처럼 실행 (standalone 모드)
- ✅ Service Worker 등록 확인

---

## 📱 방법 3: 실제 배포 서버에서 테스트 (가장 정확)

### HTTPS 환경 필요
PWA는 HTTPS 환경에서 가장 잘 작동합니다.

1. **배포 서버에 업로드** (예: Vercel, Netlify, AWS 등)
2. **HTTPS URL로 접속**
3. 모바일 브라우저에서 **홈 화면에 추가**

---

## 🔍 모바일에서 PWA 확인 방법

### Chrome DevTools (Android)
1. 모바일 Chrome에서 페이지 열기
2. PC Chrome에서 `chrome://inspect` 접속
3. USB 디버깅으로 연결된 기기 확인
4. **"inspect"** 클릭하여 개발자 도구 열기

### Safari Web Inspector (iOS)
1. iOS 설정 → Safari → 고급 → **"웹 검사기"** 활성화
2. Mac Safari → 개발 → [기기명] → [페이지명] 선택
3. 개발자 도구에서 Application 탭 확인

---

## ✅ 확인할 PWA 기능

### 1. Manifest 확인
- Application 탭 → Manifest
- 앱 이름, 아이콘, 테마 컬러 확인

### 2. Service Worker 확인
- Application 탭 → Service Workers
- 상태가 **"activated"** 인지 확인

### 3. 홈 화면에 추가
- 브라우저 메뉴에서 "홈 화면에 추가" 옵션 확인
- 추가 후 아이콘이 제대로 표시되는지 확인

### 4. 오프라인 테스트
- 비행기 모드 활성화
- 일부 페이지가 여전히 작동하는지 확인

---

## 🛠️ 문제 해결

### "홈 화면에 추가" 옵션이 안 보일 때
- ✅ HTTPS 환경인지 확인 (localhost는 예외)
- ✅ manifest.webmanifest 파일이 로드되는지 확인
- ✅ Service Worker가 등록되었는지 확인
- ✅ 브라우저 캐시 클리어

### 모바일에서 접속이 안 될 때
- ✅ 컴퓨터와 모바일이 같은 Wi-Fi인지 확인
- ✅ 방화벽 설정 확인
- ✅ IP 주소가 올바른지 확인 (`ifconfig` 또는 `ipconfig`로 확인)

### Service Worker가 등록 안 될 때
- ✅ HTTPS 환경인지 확인
- ✅ 브라우저 콘솔에서 에러 확인
- ✅ 개발자 도구 → Application → Service Workers 확인

---

## 📝 현재 설정 확인

현재 IP 주소: **192.168.219.104**
포트: **5174** (개발), **4173** (프로덕션)

IP 주소가 변경되면 다시 확인:
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I

# Windows
ipconfig
```











