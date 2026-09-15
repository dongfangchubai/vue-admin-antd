<script setup lang="ts">
/**
 * 根组件：统一注入 Ant Design Vue 中文语言包与主题。
 * 业务页面都从这里的 RouterView 开始渲染。
 */
import { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
      },
    }"
  >
    <RouterView />
  </a-config-provider>
</template>
