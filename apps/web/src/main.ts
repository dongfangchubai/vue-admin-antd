/**
 * 应用入口：挂载 Vue，并注册 Pinia / Router。
 * 注意先注册 Pinia，再注册 Router，以便路由守卫里能直接使用 store。
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'ant-design-vue/dist/reset.css'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
