import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://prepair.wisoft.dev',
        changeOrigin: true,
        secure: false, // SSL 인증서 무시 (https 접속 문제 해결)
        ws: true,
        // 디버깅을 위한 로그 강화
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[PROXY ERROR] 프록시 에러 발생:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[PROXY REQ] 요청 보냄:', req.method, req.url, '->', proxyReq.path);
            console.log('[PROXY REQ] Content-Type:', proxyReq.getHeader('content-type'));
            
            // POST 요청의 경우 body 로깅
            if (req.method === 'POST' && req.body) {
              const bodyString = typeof req.body === 'string' 
                ? req.body 
                : JSON.stringify(req.body);
              console.log('[PROXY REQ] Request body length:', bodyString?.length);
              console.log('[PROXY REQ] Request body preview:', bodyString?.substring(0, 200));
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[PROXY RES] 응답 받음:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})