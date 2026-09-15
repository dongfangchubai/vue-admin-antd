/**
 * 全局 UI 状态：侧边栏折叠等。
 */
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const COLLAPSED_KEY = 'vue-admin-antd-sider-collapsed'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(localStorage.getItem(COLLAPSED_KEY) === '1')

  // 折叠状态持久化，刷新后保持用户偏好
  watch(collapsed, (value) => {
    localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
  })

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  return {
    collapsed,
    toggleCollapsed,
  }
})
