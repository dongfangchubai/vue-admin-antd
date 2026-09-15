/**
 * 多标签页状态：
 * - visitedViews：已打开的标签列表
 * - cachedViews：提供给 KeepAlive include 的组件 name 列表
 * - refreshKeys：刷新时递增，驱动页面动态 key 强制重建
 */
import { computed, nextTick, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  path: string
  fullPath: string
  name?: string | symbol | null
  title: string
  /** 固定标签（如仪表盘）不可关闭 */
  affix?: boolean
}

/** 将路由转成标签；公开页 / 隐藏页 / 无标题页不进入标签栏 */
function toTag(route: RouteLocationNormalized): TagView | null {
  if (!route.name || route.meta.public || route.meta.hidden || !route.meta.title) {
    return null
  }

  return {
    path: route.path,
    fullPath: route.fullPath,
    name: route.name,
    title: String(route.meta.title),
    affix: Boolean(route.meta.affix),
  }
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])
  /** path -> 刷新次数；仅在刷新时变化，平时切换标签复用旧值以保留缓存 */
  const refreshKeys = ref<Record<string, number>>({})

  const affixViews = computed(() => visitedViews.value.filter((item) => item.affix))

  /** KeepAlive 子组件的 key：path + 刷新次数，次数变化才会强制重建 */
  function getViewKey(path: string) {
    return `${path}__${refreshKeys.value[path] ?? 0}`
  }

  function addView(route: RouteLocationNormalized) {
    const tag = toTag(route)
    if (!tag) return

    if (!visitedViews.value.some((item) => item.path === tag.path)) {
      visitedViews.value.push(tag)
    } else {
      const index = visitedViews.value.findIndex((item) => item.path === tag.path)
      if (index !== -1) {
        // 同 path 再次进入时同步 fullPath / title（例如 query 变化）
        visitedViews.value[index] = { ...visitedViews.value[index], ...tag, title: tag.title }
      }
    }

    addCachedView(tag)
  }

  function addCachedView(view: TagView) {
    // KeepAlive include 匹配的是组件 name（需与路由 name / defineOptions.name 一致）
    const name = typeof view.name === 'string' ? view.name : ''
    if (!name || cachedViews.value.includes(name)) return
    cachedViews.value.push(name)
  }

  function delView(path: string) {
    const index = visitedViews.value.findIndex((item) => item.path === path)
    if (index === -1) return null

    const [removed] = visitedViews.value.splice(index, 1)
    if (removed) {
      delCachedView(removed)
    }
    delete refreshKeys.value[path]
    return removed ?? null
  }

  function delCachedView(view: TagView) {
    const name = typeof view.name === 'string' ? view.name : ''
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  function syncCachedViews() {
    cachedViews.value = visitedViews.value
      .map((item) => (typeof item.name === 'string' ? item.name : ''))
      .filter(Boolean)
  }

  function delOthersViews(path: string) {
    visitedViews.value = visitedViews.value.filter((item) => item.affix || item.path === path)
    Object.keys(refreshKeys.value).forEach((key) => {
      if (!visitedViews.value.some((item) => item.path === key)) {
        delete refreshKeys.value[key]
      }
    })
    syncCachedViews()
  }

  function delAllViews() {
    visitedViews.value = visitedViews.value.filter((item) => item.affix)
    Object.keys(refreshKeys.value).forEach((key) => {
      if (!visitedViews.value.some((item) => item.path === key)) {
        delete refreshKeys.value[key]
      }
    })
    syncCachedViews()
  }

  function delLeftViews(path: string) {
    const index = visitedViews.value.findIndex((item) => item.path === path)
    if (index === -1) return
    visitedViews.value = visitedViews.value.filter((item, i) => i >= index || item.affix)
    Object.keys(refreshKeys.value).forEach((key) => {
      if (!visitedViews.value.some((item) => item.path === key)) {
        delete refreshKeys.value[key]
      }
    })
    syncCachedViews()
  }

  function delRightViews(path: string) {
    const index = visitedViews.value.findIndex((item) => item.path === path)
    if (index === -1) return
    visitedViews.value = visitedViews.value.filter((item, i) => i <= index || item.affix)
    Object.keys(refreshKeys.value).forEach((key) => {
      if (!visitedViews.value.some((item) => item.path === key)) {
        delete refreshKeys.value[key]
      }
    })
    syncCachedViews()
  }

  /**
   * 刷新指定标签：
   * 1. 先移出 KeepAlive 缓存
   * 2. 递增 refreshKeys，改变组件 key 强制重建
   * 3. nextTick 后再加回缓存，让新实例继续被缓存
   */
  async function refreshView(path: string) {
    const view = visitedViews.value.find((item) => item.path === path)
    if (!view) return

    delCachedView(view)
    refreshKeys.value[path] = (refreshKeys.value[path] ?? 0) + 1

    await nextTick()
    addCachedView(view)
  }

  /** 退出登录时清空标签与缓存，避免脏状态带到下次会话 */
  function reset() {
    visitedViews.value = []
    cachedViews.value = []
    refreshKeys.value = {}
  }

  return {
    visitedViews,
    cachedViews,
    refreshKeys,
    affixViews,
    getViewKey,
    addView,
    delView,
    delOthersViews,
    delAllViews,
    delLeftViews,
    delRightViews,
    refreshView,
    reset,
  }
})
