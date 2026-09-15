<script setup lang="ts">
/**
 * 多标签栏：打开同步、切换、关闭、右键菜单、刷新。
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CloseOutlined,
  ReloadOutlined,
  VerticalRightOutlined,
  VerticalLeftOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'

import { useTagsViewStore, type TagView } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const activePath = computed(() => route.path)
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const selectedTag = ref<TagView | null>(null)

// 路由变化时自动收录到标签栏
watch(
  () => route.fullPath,
  () => {
    tagsViewStore.addView(route)
  },
  { immediate: true },
)

async function openTag(tag: TagView) {
  if (tag.path === route.path) return
  await router.push(tag.fullPath || tag.path)
}

async function closeTag(tag: TagView, event?: Event) {
  event?.stopPropagation()
  if (tag.affix) return

  const isActive = tag.path === route.path
  tagsViewStore.delView(tag.path)

  // 关掉当前页时，跳到剩余标签的最后一个
  if (!isActive) return

  const latest = tagsViewStore.visitedViews.at(-1)
  await router.push(latest?.fullPath || latest?.path || '/dashboard')
}

function openContextMenu(tag: TagView, event: MouseEvent) {
  event.preventDefault()
  selectedTag.value = tag
  contextMenuVisible.value = true
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`,
  }
}

function closeContextMenu() {
  contextMenuVisible.value = false
  selectedTag.value = null
}

async function refreshSelected() {
  if (!selectedTag.value) return
  const tag = selectedTag.value
  closeContextMenu()

  // 刷新非当前标签时先切过去，再改 key 触发重建
  if (tag.path !== route.path) {
    await router.push(tag.fullPath || tag.path)
  }

  await tagsViewStore.refreshView(tag.path)
}

async function closeSelected() {
  if (!selectedTag.value || selectedTag.value.affix) {
    closeContextMenu()
    return
  }
  await closeTag(selectedTag.value)
  closeContextMenu()
}

async function closeOthers() {
  if (!selectedTag.value) return
  tagsViewStore.delOthersViews(selectedTag.value.path)
  closeContextMenu()
  if (route.path !== selectedTag.value.path) {
    await router.push(selectedTag.value.fullPath)
  }
}

async function closeLeft() {
  if (!selectedTag.value) return
  tagsViewStore.delLeftViews(selectedTag.value.path)
  closeContextMenu()
  // 若当前路由已被关掉，回落到右键选中的标签
  if (!tagsViewStore.visitedViews.some((item) => item.path === route.path)) {
    await router.push(selectedTag.value.fullPath)
  }
}

async function closeRight() {
  if (!selectedTag.value) return
  tagsViewStore.delRightViews(selectedTag.value.path)
  closeContextMenu()
  if (!tagsViewStore.visitedViews.some((item) => item.path === route.path)) {
    await router.push(selectedTag.value.fullPath)
  }
}

async function closeAll() {
  tagsViewStore.delAllViews()
  closeContextMenu()
  const latest = tagsViewStore.visitedViews.at(-1)
  await router.push(latest?.fullPath || '/dashboard')
}

watch(contextMenuVisible, (visible) => {
  if (!visible) return
  // 下一帧再监听点击，避免本次右键事件立刻把菜单关掉
  void nextTick(() => {
    document.addEventListener('click', closeContextMenu, { once: true })
  })
})
</script>

<template>
  <div class="tags-view">
    <div class="tags-view__scroll">
      <div
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        class="tags-view__item"
        :class="{ 'is-active': tag.path === activePath }"
        @click="openTag(tag)"
        @contextmenu="openContextMenu(tag, $event)"
      >
        <span class="tags-view__title">{{ tag.title }}</span>
        <CloseOutlined
          v-if="!tag.affix"
          class="tags-view__close"
          @click="closeTag(tag, $event)"
        />
      </div>
    </div>

    <ul
      v-show="contextMenuVisible"
      class="tags-view__menu"
      :style="contextMenuStyle"
    >
      <li @click="refreshSelected">
        <ReloadOutlined />
        刷新
      </li>
      <li :class="{ disabled: selectedTag?.affix }" @click="closeSelected">
        <CloseOutlined />
        关闭
      </li>
      <li @click="closeOthers">
        <CloseCircleOutlined />
        关闭其他
      </li>
      <li @click="closeLeft">
        <VerticalRightOutlined />
        关闭左侧
      </li>
      <li @click="closeRight">
        <VerticalLeftOutlined />
        关闭右侧
      </li>
      <li @click="closeAll">
        <CloseCircleOutlined />
        关闭全部
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tags-view {
  position: relative;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 6px 12px 0;
}

.tags-view__scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.tags-view__scroll::-webkit-scrollbar {
  height: 4px;
}

.tags-view__scroll::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 999px;
}

.tags-view__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
}

.tags-view__item:hover {
  color: #1677ff;
  border-color: #91caff;
}

.tags-view__item.is-active {
  color: #1677ff;
  background: #e6f4ff;
  border-color: #91caff;
}

.tags-view__close {
  font-size: 10px;
  padding: 2px;
  border-radius: 50%;
}

.tags-view__close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #ff4d4f;
}

.tags-view__menu {
  position: fixed;
  z-index: 1000;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.tags-view__menu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.75);
  font-size: 13px;
}

.tags-view__menu li:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.tags-view__menu li.disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
