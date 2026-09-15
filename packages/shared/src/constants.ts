/** localStorage 键名，供各应用统一读写登录态 */
export const AUTH_STORAGE_KEYS = {
  token: 'vue-admin-antd-auth-token',
  user: 'vue-admin-antd-auth-user',
} as const

/** 演示账号（仅本地模板使用，接入真实接口后应移除） */
export const DEMO_ACCOUNT = {
  username: 'admin',
  password: 'admin123',
} as const

export type UserStatus = '启用' | '禁用'

/** 用户管理演示数据结构 */
export interface DemoUser {
  id: number
  username: string
  name: string
  role: string
  email: string
  status: UserStatus
  createdAt: string
}
