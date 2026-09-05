import { createRouter, createWebHistory } from 'vue-router'
import privacyMarkdown from '../../PRIVACY.md?raw'
import termsMarkdown from '../../TERMS.md?raw'
import HomeView from '@/views/HomeView.vue'
import LegalView from '@/views/LegalView.vue'
import LoginView from '@/views/LoginView.vue'
import TikTokCallbackView from '@/views/TikTokCallbackView.vue'

const DEFAULT_TITLE = 'AutoTok — Cortes e postagem'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: DEFAULT_TITLE },
    },
    {
      path: '/privacy',
      name: 'privacy',
      alias: '/privacy/',
      component: LegalView,
      props: {
        source: privacyMarkdown,
        eyebrow: 'Privacy Policy',
      },
      meta: { title: 'Privacy Policy — AutoTok' },
    },
    {
      path: '/terms',
      name: 'terms',
      alias: '/terms/',
      component: LegalView,
      props: {
        source: termsMarkdown,
        eyebrow: 'Terms of Service',
      },
      meta: { title: 'Terms of Service — AutoTok' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Entrar — AutoTok' },
    },
    {
      path: '/integrations/tiktok',
      name: 'tiktok-callback',
      component: TikTokCallbackView,
      meta: { title: 'TikTok — AutoTok' },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title || DEFAULT_TITLE
})

export default router
