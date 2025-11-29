import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Service Worker 등록 및 업데이트 처리
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // 새로운 버전이 있을 때 사용자에게 알림
      if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('앱이 오프라인에서 작동할 준비가 되었습니다.')
    },
  })
}
