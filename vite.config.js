import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png'],
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      manifest: {
        filename: 'manifest.webmanifest',
        name: 'PrePair',
        short_name: 'PrePair',
        description: 'PrePair - 면접 준비를 위한 AI 코치',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/showcase/**'], // showcase 폴더 제외 (큰 이미지 파일들)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB로 증가
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/prepair\.wisoft\.dev\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
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