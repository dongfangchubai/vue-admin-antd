<script setup lang="ts">
/**
 * 个人中心：展示当前登录用户并编辑基础资料（本地演示）。
 * defineOptions.name 必须与路由 name 一致，KeepAlive include 才能命中。
 */
import { reactive } from 'vue'
import { message } from 'ant-design-vue'

import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'account-profile' })

const auth = useAuthStore()

const form = reactive({
  username: auth.username ?? '',
  nickname: '系统管理员',
  email: 'admin@lumen.dev',
  bio: '负责 Lumen Admin 演示环境。',
})

function onSave() {
  message.success('个人资料已保存（本地演示）')
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h2 class="m-0 text-xl font-semibold text-slate-800">个人中心</h2>
      <p class="mt-1 mb-0 text-slate-500">查看并维护当前登录账号信息。</p>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="8">
        <a-card :bordered="false">
          <div class="flex flex-col items-center py-4 text-center">
            <a-avatar :size="72" class="bg-[#1677ff] text-2xl">
              {{ (auth.username ?? 'A').slice(0, 1).toUpperCase() }}
            </a-avatar>
            <div class="mt-3 text-lg font-semibold text-slate-800">{{ auth.username }}</div>
            <div class="mt-1 text-slate-500">超级管理员</div>
            <a-divider />
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="状态">已登录</a-descriptions-item>
              <a-descriptions-item label="Token">本地演示 Token</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="16">
        <a-card title="基础资料" :bordered="false">
          <a-form layout="vertical" class="max-w-xl" @finish="onSave">
            <a-form-item label="用户名">
              <a-input v-model:value="form.username" disabled />
            </a-form-item>
            <a-form-item label="昵称" name="nickname" :rules="[{ required: true, message: '请输入昵称' }]">
              <a-input v-model:value="form.nickname" />
            </a-form-item>
            <a-form-item label="邮箱" name="email" :rules="[{ required: true, type: 'email', message: '请输入有效邮箱' }]">
              <a-input v-model:value="form.email" />
            </a-form-item>
            <a-form-item label="简介">
              <a-textarea v-model:value="form.bio" :rows="4" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit">保存修改</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
