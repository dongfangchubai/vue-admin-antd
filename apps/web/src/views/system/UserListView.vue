<script setup lang="ts">
/**
 * 用户管理：本地 CRUD 演示（查询 / 新建 / 编辑 / 删除）。
 * defineOptions.name 必须与路由 name 一致，KeepAlive include 才能命中。
 */
import { computed, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { DemoUser, UserStatus } from '@vue-admin-antd/shared'

defineOptions({ name: 'system-users' })

type UserRecord = DemoUser

const keyword = ref('')
const statusFilter = ref<string | undefined>()
const loading = ref(false)
const modalOpen = ref(false)
/** 非空表示编辑模式，否则为新建 */
const editingId = ref<number | null>(null)

const users = ref<UserRecord[]>([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: '超级管理员',
    email: 'admin@lumen.dev',
    status: '启用',
    createdAt: '2026-01-08',
  },
  {
    id: 2,
    username: 'ops_chen',
    name: '陈运维',
    role: '运维',
    email: 'chen@lumen.dev',
    status: '启用',
    createdAt: '2026-02-14',
  },
  {
    id: 3,
    username: 'pm_liu',
    name: '刘产品',
    role: '产品',
    email: 'liu@lumen.dev',
    status: '禁用',
    createdAt: '2026-03-21',
  },
  {
    id: 4,
    username: 'dev_wang',
    name: '王开发',
    role: '开发',
    email: 'wang@lumen.dev',
    status: '启用',
    createdAt: '2026-04-02',
  },
])

const form = reactive({
  username: '',
  name: '',
  role: '开发',
  email: '',
  status: '启用' as UserStatus,
})

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
  { title: '操作', key: 'action', width: 160 },
]

/** 前端本地过滤；接入接口后应改为服务端查询参数 */
const filteredUsers = computed(() =>
  users.value.filter((item) => {
    const hitKeyword =
      !keyword.value ||
      item.username.includes(keyword.value) ||
      item.name.includes(keyword.value) ||
      item.email.includes(keyword.value)
    const hitStatus = !statusFilter.value || item.status === statusFilter.value
    return hitKeyword && hitStatus
  }),
)

function resetForm() {
  form.username = ''
  form.name = ''
  form.role = '开发'
  form.email = ''
  form.status = '启用'
  editingId.value = null
}

function openCreate() {
  resetForm()
  modalOpen.value = true
}

function openEdit(record: UserRecord) {
  editingId.value = record.id
  form.username = record.username
  form.name = record.name
  form.role = record.role
  form.email = record.email
  form.status = record.status
  modalOpen.value = true
}

function onSearch() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 300)
}

function onReset() {
  keyword.value = ''
  statusFilter.value = undefined
  onSearch()
}

function onSubmit() {
  if (!form.username || !form.name || !form.email) {
    message.warning('请完善必填信息')
    return
  }

  // editingId 有值走更新，否则走新增
  if (editingId.value) {
    const target = users.value.find((item) => item.id === editingId.value)
    if (target) {
      Object.assign(target, { ...form })
    }
    message.success('用户已更新')
  } else {
    users.value.unshift({
      id: Date.now(),
      ...form,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('用户已创建')
  }

  modalOpen.value = false
}

function onDelete(record: UserRecord) {
  Modal.confirm({
    title: `确认删除用户「${record.name}」？`,
    content: '该操作为演示删除，可随时刷新恢复初始数据。',
    okType: 'danger',
    onOk() {
      users.value = users.value.filter((item) => item.id !== record.id)
      message.success('已删除')
    },
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="m-0 text-xl font-semibold text-slate-800">用户管理</h2>
        <p class="mt-1 mb-0 text-slate-500">演示 CRUD：查询、新增、编辑、删除。</p>
      </div>
      <a-button type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        新建用户
      </a-button>
    </div>

    <a-card :bordered="false">
      <a-form class="user-search" layout="inline" @finish="onSearch">
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="用户名 / 姓名 / 邮箱"
            class="user-search__keyword"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item label="状态">
          <a-select
            v-model:value="statusFilter"
            allow-clear
            placeholder="全部"
            class="user-search__status"
            :options="[
              { label: '启用', value: '启用' },
              { label: '禁用', value: '禁用' },
            ]"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">查询</a-button>
            <a-button @click="onReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 8, showTotal: (total: number) => `共 ${total} 条` }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="(record as UserRecord).status === '启用' ? 'success' : 'default'"
              :text="(record as UserRecord).status"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openEdit(record as UserRecord)">编辑</a>
              <a class="text-rose-500" @click="onDelete(record as UserRecord)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? '编辑用户' : '新建用户'"
      ok-text="保存"
      cancel-text="取消"
      @ok="onSubmit"
    >
      <a-form layout="vertical" class="mt-4">
        <a-form-item label="用户名" required>
          <a-input v-model:value="form.username" :disabled="Boolean(editingId)" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="form.role"
            :options="[
              { label: '超级管理员', value: '超级管理员' },
              { label: '运维', value: '运维' },
              { label: '产品', value: '产品' },
              { label: '开发', value: '开发' },
            ]"
          />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio value="启用">启用</a-radio>
            <a-radio value="禁用">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-search {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  margin-bottom: 16px;
}

.user-search :deep(.ant-form-item) {
  margin-inline-end: 16px;
  margin-bottom: 8px;
}

.user-search__keyword {
  width: 260px;
}

.user-search__status {
  width: 140px;
}

@media (max-width: 640px) {
  .user-search__keyword,
  .user-search__status {
    width: 100%;
  }

  .user-search :deep(.ant-form-item) {
    width: 100%;
    margin-inline-end: 0;
  }

  .user-search :deep(.ant-form-item-control-input-content) {
    width: 100%;
  }
}
</style>
