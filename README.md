# ExploreAgent

DeerFlow 风格的 research agent 练手项目。用户提问 → 规划 → 联网搜索 → 汇总报告。
npm workspaces monorepo，含 agent 核心、后端接口、前端展示三部分。

## 目录结构

```
ExploreAgent/
├─ package.json        # workspace 根，聚合脚本
├─ apps/
│  ├─ agent/           # research agent 核心：LangGraph.js + Anthropic（骨架，逻辑待写）
│  ├─ api/             # 后端：NestJS（全局前缀 /api，已开启 CORS）
│  └─ web/             # 前端：Vite + React + TypeScript + Ant Design
```

## 技术栈

- Agent：LangGraph.js（`@langchain/langgraph`）+ `@langchain/anthropic`，规划 → 搜索 → 汇总
- 后端：NestJS（计划提供 `/api/agent` 接口调用 agent）
- 前端：Vite + React 18 + TypeScript + Ant Design
- LLM：Anthropic Claude
- 搜索：Tavily（联网搜索工具，可先 mock）

## 环境变量

`apps/agent/.env.example` 列出所需 key（复制为 `.env` 后填入，`.env` 不入库）：

- `ANTHROPIC_API_KEY`：Claude 模型（必填）
- `TAVILY_API_KEY`：联网搜索（可选，未填时用 mock 搜索）

## 快速开始

```bash
npm install            # 根目录安装全部 workspace 依赖

npm run dev:agent      # 运行 agent（需先写 src/index.ts）
npm run dev:api        # 启动后端（http://localhost:3000，接口前缀 /api）
npm run dev:web        # 启动前端（http://localhost:5173，/api 代理到后端）
```

## 各部分状态

| workspace | 状态 |
|-----------|------|
| `apps/agent` | 依赖与 tsconfig 就绪，`src/` 为空目录，agent 逻辑（planner/researcher/reporter、搜索工具）待编写 |
| `apps/api` | NestJS 骨架可运行，`GET /api` 返回 200；`/api/agent` 接口待添加 |
| `apps/web` | Vite+React+TS+AntD 骨架可运行，业务页面待开发 |

> 注意：`apps/agent` 的 `dev`/`build` 脚本指向 `src/index.ts`，该文件尚未创建，
> 因此在写入 agent 逻辑前这两个脚本会失败，属预期状态。

## 下一步

- agent：在 `apps/agent/src` 用 LangGraph 搭 planner → researcher → reporter 图，接入搜索工具
- api：新增 `/api/agent` 接口调用 agent
- web：做一个提问 + 展示研究报告的页面
