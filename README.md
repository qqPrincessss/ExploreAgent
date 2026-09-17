# shop-admin — 电商管理平台 + AI

npm workspaces monorepo，前后端分离，脚手架已就绪、可直接运行。

## 目录结构

```
shop-admin/
├─ package.json        # workspace 根，聚合脚本
├─ apps/
│  ├─ web/             # 前端：Vite + React + TypeScript + Ant Design
│  └─ api/             # 后端：NestJS
```

## 技术栈

- 前端：Vite + React 18 + TypeScript + Ant Design + React Router + axios + Recharts
- 后端：NestJS（全局前缀 `/api`，已开启 CORS）
- AI：预留接口（已有 API Key，待接入）

## 快速开始

```bash
npm install            # 根目录安装全部 workspace 依赖

npm run dev:api        # 启动后端（http://localhost:3000，接口前缀 /api）
npm run dev:web        # 启动前端（http://localhost:5173，/api 代理到后端）
```

前端开发服务器已配置代理：`/api` → `http://localhost:3000`，因此前端直接请求 `/api/...` 即可。

## 构建

```bash
npm run build:web      # 前端生产构建 -> apps/web/dist
npm run build:api      # 后端构建 -> apps/api/dist
```

## 验证状态

- `npm install`：通过
- `npm run build:web` / `build:api`：均通过
- `npm run lint`（web/api）：均通过
- `npm run dev:web` / `dev:api`：均可正常启动
- 联通：`GET http://localhost:3000/api` 返回 200

## 下一步（业务开发）

- 前端：接入 AntD Layout 侧边栏 + 仪表盘/商品/订单/客户/AI 页面与路由
- 后端：新增 products/orders/customers/dashboard/ai 模块
- AI：在后端 ai 模块接入 API Key
```
