/**
 * 路由表与全局守卫。
 * - meta.public：无需登录
 * - meta.affix：标签页固定（不可关闭）
 * - meta.title：面包屑 / 标签标题 / document.title
 */
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true, title: '登录' },
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          // affix：仪表盘作为默认首页标签，始终保留
          meta: { title: '仪表盘', affix: true },
        },
        {
          path: 'system/users',
          name: 'system-users',
          component: () => import('@/views/system/UserListView.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'system/roles',
          name: 'system-roles',
          component: () => import('@/views/system/RoleListView.vue'),
          meta: { title: '角色管理' },
        },
        {
          path: 'account/profile',
          name: 'account-profile',
          component: () => import('@/views/account/ProfileView.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // 未登录访问受保护页：带上 redirect，登录后可回到原目标
  if (!to.meta.public && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // 已登录再进登录页：直接进入后台
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
