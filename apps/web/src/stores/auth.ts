/**
 * 登录态：本地演示鉴权（非真实后端）。
 * token / username 持久化到 localStorage，刷新页面后仍保持登录。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AUTH_STORAGE_KEYS, DEMO_ACCOUNT } from '@vue-admin-antd/shared'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(AUTH_STORAGE_KEYS.token))
  const username = ref<string | null>(localStorage.getItem(AUTH_STORAGE_KEYS.user))
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(account: string, password: string) {
    loading.value = true
    error.value = ''

    // 模拟接口延迟，方便演示 loading 状态
    await new Promise((resolve) => setTimeout(resolve, 650))

    if (account.trim() === DEMO_ACCOUNT.username && password === DEMO_ACCOUNT.password) {
      token.value = `demo-${Date.now()}`
      username.value = account.trim()
      localStorage.setItem(AUTH_STORAGE_KEYS.token, token.value)
      localStorage.setItem(AUTH_STORAGE_KEYS.user, username.value)
      loading.value = false
      return true
    }

    error.value = `账号或密码错误，请使用 ${DEMO_ACCOUNT.username} / ${DEMO_ACCOUNT.password}`
    loading.value = false
    return false
  }

  function logout() {
    token.value = null
    username.value = null
    error.value = ''
    localStorage.removeItem(AUTH_STORAGE_KEYS.token)
    localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  }

  return {
    token,
    username,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  }
})
