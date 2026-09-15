# vue-admin-antd

基于 pnpm workspace 的 Vue 3 + Ant Design Vue 后台管理 Monorepo。

## 目录结构

```text
vue-admin-antd/
├── apps/
│   └── web/                 # 管理后台（Vue 3 + Ant Design Vue）
├── packages/
│   └── shared/              # 共享常量与类型
├── pnpm-workspace.yaml
└── package.json
```

## 技术栈

- Vue 3.5 + TypeScript + Vite 8
- Pinia + Vue Router
- Tailwind CSS 4
- Ant Design Vue 4
- Oxlint
- pnpm workspace

## 开始

```sh
pnpm install
pnpm dev
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 `apps/web` 开发服务 |
| `pnpm build` | 构建管理后台 |
| `pnpm preview` | 预览生产构建 |
| `pnpm type-check` | 全仓类型检查 |
| `pnpm lint` | 使用 Oxlint 检查 web 应用代码 |

针对单个包：

```sh
pnpm --filter @vue-admin-antd/web dev
pnpm --filter @vue-admin-antd/shared type-check
```

## 登录演示

- 账号：`admin`
- 密码：`admin123`
