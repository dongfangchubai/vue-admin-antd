<script setup lang="ts">
/**
 * 登录页：演示账号登录，成功后跳转 redirect 或仪表盘。
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DEMO_ACCOUNT } from '@vue-admin-antd/shared'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: DEMO_ACCOUNT.username,
  password: DEMO_ACCOUNT.password,
})

const showPassword = ref(false)
const demoHint = `${DEMO_ACCOUNT.username} / ${DEMO_ACCOUNT.password}`

async function onSubmit() {
  const ok = await auth.login(form.username, form.password)
  if (!ok) return

  // 守卫拦截时会写入 redirect，登录后回到原目标页
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  await router.replace(redirect)
}
</script>

<template>
  <!-- overflow-x 必须裁剪：背景动画的位移/缩放不能撑出横向滚动条，否则宽度会随滚动条出现来回跳动 -->
  <div class="relative h-full overflow-x-hidden overflow-y-auto bg-ink text-paper">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        class="animate-drift absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(31,138,138,0.35),transparent_42%),radial-gradient(circle_at_82%_12%,rgba(240,180,41,0.22),transparent_36%),linear-gradient(135deg,#081018_0%,#0d1b27_48%,#132433_100%)]"
      />
      <div
        class="animate-beam absolute -left-24 top-10 h-[70vh] w-[42vw] rotate-12 bg-[linear-gradient(90deg,transparent,rgba(243,240,232,0.08),transparent)] blur-2xl"
      />
      <div
        class="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(243,240,232,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(243,240,232,0.08)_1px,transparent_1px)] [background-size:56px_56px]"
      />
    </div>

    <main class="relative z-10 mx-auto grid min-h-full max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-10">
      <section class="animate-rise max-w-xl">
        <p class="mb-5 text-sm tracking-[0.28em] text-mist uppercase">Workspace Access</p>
        <h1 class="font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Vue Admin Antd
        </h1>
        <p class="mt-5 max-w-md text-base leading-relaxed text-mist/90 sm:text-lg">
          进入你的工作台。干净的节奏、稳定的流程，从一次登录开始。
        </p>
      </section>

      <section class="animate-rise [animation-delay:120ms]">
        <form
          class="w-full max-w-md border border-white/10 bg-ink-soft/70 p-7 backdrop-blur-md sm:p-8"
          @submit.prevent="onSubmit"
        >
          <div class="mb-7">
            <h2 class="font-display text-2xl font-bold tracking-tight">登录</h2>
            <p class="mt-2 text-sm text-mist/80">演示账号：{{ demoHint }}</p>
          </div>

          <label class="mb-4 block">
            <span class="mb-2 block text-sm text-mist">账号</span>
            <input
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              class="w-full border border-white/15 bg-ink px-3.5 py-3 text-paper outline-none transition focus:border-citrus"
              placeholder="请输入账号"
            />
          </label>

          <label class="mb-5 block">
            <span class="mb-2 block text-sm text-mist">密码</span>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="w-full border border-white/15 bg-ink px-3.5 py-3 pr-20 text-paper outline-none transition focus:border-citrus"
                placeholder="请输入密码"
              />
              <button
                type="button"
                class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-mist transition hover:text-citrus"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
          </label>

          <p v-if="auth.error" class="mb-4 text-sm text-citrus">{{ auth.error }}</p>

          <button
            type="submit"
            class="w-full bg-citrus px-4 py-3 font-semibold text-ink transition hover:bg-citrus-deep disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="auth.loading"
          >
            {{ auth.loading ? '登录中…' : '进入工作台' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>
