/// <reference types="vite/client" />

import 'vue-router'

/** 扩展路由 meta，供守卫、标签页、面包屑读取 */
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** 公开页，无需登录 */
    public?: boolean
    /** 固定标签，不可关闭 */
    affix?: boolean
    /** 不进入标签栏 */
    hidden?: boolean
  }
}
