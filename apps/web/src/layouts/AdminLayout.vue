<script setup lang="ts">
/**
 * 后台主布局：侧边栏菜单 + 顶栏 + 多标签 + 内容区 KeepAlive。
 */
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'

import TagsView from '@/components/TagsView.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useTagsViewStore } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const tagsViewStore = useTagsViewStore()
const { collapsed } = storeToRefs(appStore)

const selectedKeys = computed(() => [route.path])
const openKeys = ref<string[]>([])

/** 菜单 key 使用真实路由 path，便于和当前路由双向同步 */
const menuItems = computed<MenuProps['items']>(() => [
  {
    key: '/dashboard',
    icon: () => h(DashboardOutlined),
    label: '仪表盘',
    title: '仪表盘',
  },
  {
    key: 'system',
    icon: () => h(SettingOutlined),
    label: '系统管理',
    title: '系统管理',
    children: [
      {
        key: '/system/users',
        icon: () => h(TeamOutlined),
        label: '用户管理',
        title: '用户管理',
      },
      {
        key: '/system/roles',
        icon: () => h(UserOutlined),
        label: '角色管理',
        title: '角色管理',
      },
    ],
  },
  {
    key: '/account/profile',
    icon: () => h(UserOutlined),
    label: '个人中心',
    title: '个人中心',
  },
])

const breadcrumbItems = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title)
  return matched.map((item) => ({
    title: String(item.meta.title),
  }))
})

watch(
  () => route.path,
  (path) => {
    const { VITE_APP_TITLE } = import.meta.env
    document.title = `${String(route.meta.title ?? VITE_APP_TITLE)} - ${VITE_APP_TITLE}`
    // 进入系统子页时自动展开对应父菜单
    if (path.startsWith('/system') && !openKeys.value.includes('system')) {
      openKeys.value = [...openKeys.value, 'system']
    }
  },
  { immediate: true },
)

function onMenuClick(info: { key: string | number }) {
  const key = String(info.key)
  // 父级分组 key（如 system）不是路由，只处理以 / 开头的叶子菜单
  if (key.startsWith('/')) {
    void router.push(key)
  }
}

async function onLogout() {
  authStore.logout()
  tagsViewStore.reset()
  message.success('已退出登录')
  await router.replace({ name: 'login' })
}
</script>

<template>
  <a-layout class="admin-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
      theme="dark"
      width="220"
      class="admin-sider"
    >
      <div class="brand" :class="{ 'brand--collapsed': collapsed }">
        <span class="brand__mark">V</span>
        <span v-if="!collapsed" class="brand__text">Vue Admin Antd</span>
      </div>

      <a-menu
        v-model:open-keys="openKeys"
        theme="dark"
        mode="inline"
        :selected-keys="selectedKeys"
        :items="menuItems"
        @click="onMenuClick"
      />
    </a-layout-sider>

    <a-layout class="admin-main">
      <a-layout-header class="admin-header">
        <div class="admin-header__left">
          <a-button type="text" class="trigger" @click="appStore.toggleCollapsed()">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <a-breadcrumb :items="breadcrumbItems" />
        </div>

        <div class="admin-header__right">
          <a-dropdown>
            <a class="user-entry" @click.prevent>
              <a-avatar :size="32" class="user-entry__avatar">
                {{ (authStore.username ?? 'A').slice(0, 1).toUpperCase() }}
              </a-avatar>
              <span class="user-entry__name">{{ authStore.username }}</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="router.push('/account/profile')">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="onLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <TagsView />

      <!-- 仅内容区滚动，外层页面不出现滚动条 -->
      <a-layout-content class="admin-content">
        <div class="admin-content__inner">
          <!-- include 控制缓存名单；key 变化时强制重建当前页实例 -->
          <RouterView v-slot="{ Component, route: currentRoute }">
            <KeepAlive :include="tagsViewStore.cachedViews">
              <component :is="Component" :key="tagsViewStore.getViewKey(currentRoute.path)" />
            </KeepAlive>
          </RouterView>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.admin-layout {
  height: 100%;
  overflow: hidden;
  background: #f5f7fb;
}

.admin-sider {
  height: 100% !important;
  overflow: auto;
}

.admin-main {
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 20px;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
}

.brand--collapsed {
  justify-content: center;
  padding: 0;
}

.brand__mark {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  font-weight: 700;
}

.brand__text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  height: 64px;
  line-height: 64px;
}

.admin-header__left,
.admin-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trigger {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.75);
}

.user-entry__avatar {
  background: #1677ff;
}

.user-entry__name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-content {
  flex: 1;
  min-height: 0;
  margin: 16px;
  overflow: auto;
}

.admin-content__inner {
  min-height: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
}
</style>
