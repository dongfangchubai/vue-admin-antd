<script setup lang="ts">
/**
 * 工作台首页：统计卡片与订单列表（本地模拟数据）。
 * defineOptions.name 必须与路由 name 一致，KeepAlive include 才能命中。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  TeamOutlined,
  ShoppingOutlined,
  RiseOutlined,
  CloudServerOutlined,
} from '@ant-design/icons-vue'

import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'dashboard' })

const router = useRouter()

const auth = useAuthStore()

const stats = [
  { title: '活跃用户', value: 1286, suffix: '人', icon: TeamOutlined, color: '#1677ff', trend: 12.4 },
  { title: '今日订单', value: 326, suffix: '单', icon: ShoppingOutlined, color: '#13c2c2', trend: 4.1 },
  { title: '转化率', value: 38.6, suffix: '%', icon: RiseOutlined, color: '#52c41a', trend: -1.8 },
  { title: '服务可用性', value: 99.95, suffix: '%', icon: CloudServerOutlined, color: '#faad14', trend: 0.2 },
]

const recentOrders = [
  { id: 'ORD-10421', user: '张三', amount: 1280, status: '已完成' },
  { id: 'ORD-10420', user: '李四', amount: 860, status: '处理中' },
  { id: 'ORD-10419', user: '王五', amount: 420, status: '已完成' },
  { id: 'ORD-10418', user: '赵六', amount: 1999, status: '待支付' },
  { id: 'ORD-10417', user: '钱七', amount: 320, status: '已取消' },
]

const columns = [
  { title: '订单号', dataIndex: 'id', key: 'id' },
  { title: '用户', dataIndex: 'user', key: 'user' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

function statusColor(status: string) {
  switch (status) {
    case '已完成':
      return 'success'
    case '处理中':
      return 'processing'
    case '待支付':
      return 'warning'
    default:
      return 'default'
  }
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="m-0 text-xl font-semibold text-slate-800">
        {{ greeting }}，{{ auth.username }}
      </h2>
      <p class="mt-2 mb-0 text-slate-500">这是 Ant Design Vue 后台模板的工作台概览。</p>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col v-for="item in stats" :key="item.title" :xs="24" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-slate-500">{{ item.title }}</div>
              <div class="mt-2 text-2xl font-semibold text-slate-800">
                {{ item.value }}
                <span class="text-sm font-normal text-slate-400">{{ item.suffix }}</span>
              </div>
              <div class="mt-2 text-sm" :class="item.trend >= 0 ? 'text-emerald-600' : 'text-rose-500'">
                <ArrowUpOutlined v-if="item.trend >= 0" />
                <ArrowDownOutlined v-else />
                {{ Math.abs(item.trend) }}% 较上周
              </div>
            </div>
            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white"
              :style="{ background: item.color }"
            >
              <component :is="item.icon" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="16">
        <a-card title="最近订单" :bordered="false">
          <a-table
            :columns="columns"
            :data-source="recentOrders"
            :pagination="false"
            row-key="id"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">¥ {{ record.amount.toLocaleString() }}</template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="快捷入口" :bordered="false">
          <a-space direction="vertical" class="w-full" :size="12">
            <a-button block type="primary" @click="router.push('/system/users')">去用户管理</a-button>
            <a-button block @click="router.push('/system/roles')">去角色管理</a-button>
            <a-button block @click="router.push('/account/profile')">去个人中心</a-button>
            <a-alert
              type="info"
              show-icon
              message="演示环境"
              description="数据均为本地模拟，可直接替换为真实接口。"
            />
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.stat-card {
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
</style>
