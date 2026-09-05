import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const distDir = fileURLToPath(new URL('./dist', import.meta.url))

function githubPagesRoutes(routes = ['privacy', 'terms', 'login', 'integrations/tiktok']) {
  return {
    name: 'github-pages-routes',
    apply: 'build',
    closeBundle() {
      const index = join(distDir, 'index.html')
      if (!existsSync(index)) return

      copyFileSync(index, join(distDir, '404.html'))

      for (const route of routes) {
        const dir = join(distDir, route)
        mkdirSync(dir, { recursive: true })
        copyFileSync(index, join(dir, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  // Project site: https://mathiore.github.io/autopost/
  base: process.env.GITHUB_ACTIONS ? '/autopost/' : '/',
  plugins: [vue(), githubPagesRoutes()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
      },
    },
  },
})
