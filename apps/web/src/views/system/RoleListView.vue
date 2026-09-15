<script setup lang="ts">
/**
 * 角色管理：权限标签展示（本地模拟）。
 * defineOptions.name 必须与路由 name 一致，KeepAlive include 才能命中。
 */
import { ref } from 'vue'
import { message } from 'ant-design-vue'

defineOptions({ name: 'system-roles' })

interface RoleRecord {
  id: number
  name: string
  code: string
  remark: string
  permissions: string[]
  userCount: number
}

const roles = ref<RoleRecord[]>([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    remark: '拥有全部权限',
    permissions: ['dashboard', 'user', 'role', 'profile'],
    userCount: 1,
  },
  {
    id: 2,
    name: '运维',
    code: 'ops',
    remark: '系统运维与监控',
    permissions: ['dashboard', 'user', 'profile'],
    userCount: 3,
  },
  {
    id: 3,
    name: '开发',
    code: 'developer',
    remark: '业务开发与联调',
    permissions: ['dashboard', 'profile'],
    userCount: 8,
  },
])

const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '角色编码', dataIndex: 'code', key: 'code' },
  { title: '权限', dataIndex: 'permissions', key: 'permissions' },
  { title: '用户数', dataIndex: 'userCount', key: 'userCount', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'action', width: 120 },
]

function onAssign(record: RoleRecord) {
  message.info(`已打开「${record.name}」权限配置（演示）`)
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h2 class="m-0 text-xl font-semibold text-slate-800">角色管理</h2>
      <p class="mt-1 mb-0 text-slate-500">按角色组织权限，对接后端后可替换为接口数据。</p>
    </div>

    <a-card :bordered="false">
      <a-table :columns="columns" :data-source="roles" row-key="id" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag
                v-for="item in (record as RoleRecord).permissions"
                :key="item"
                color="blue"
              >
                {{ item }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="onAssign(record as RoleRecord)">配置权限</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
