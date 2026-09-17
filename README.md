# ExploreAgent

基于 LangGraph.js 与 Anthropic Claude 的深度研究 Agent。面向一个研究问题，自动完成任务规划、联网检索与信息汇总，最终输出结构化研究报告。

## 特性

- **任务规划**：将研究问题拆解为可执行的子任务
- **联网检索**：通过搜索工具获取实时信息
- **报告汇总**：整合检索结果，生成结构化研究报告
- **前后端一体**：提供 HTTP 接口与 Web 界面，可交互式发起研究

## 架构

采用 npm workspaces 管理的 monorepo，分为三个部分：

```
ExploreAgent/
├─ apps/
│  ├─ agent/    Agent 核心：LangGraph.js 编排 + Anthropic Claude
│  ├─ api/      后端服务：NestJS，对外提供 HTTP 接口
│  └─ web/      前端界面：Vite + React + TypeScript + Ant Design
```

| 模块 | 技术栈 |
|------|--------|
| Agent | LangGraph.js（`@langchain/langgraph`）、`@langchain/anthropic` |
| 后端 | NestJS |
| 前端 | Vite、React、TypeScript、Ant Design |

## 环境要求

- Node.js >= 20
- Anthropic API Key
- 搜索服务 API Key（Tavily）

## 环境变量

复制 `apps/agent/.env.example` 为 `apps/agent/.env` 并填入：

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic Claude 模型密钥 |
| `TAVILY_API_KEY` | Tavily 搜索服务密钥 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动后端服务（http://localhost:3000，接口前缀 /api）
npm run dev:api

# 启动前端界面（http://localhost:5173）
npm run dev:web

# 运行 Agent
npm run dev:agent
```

## 构建

```bash
npm run build:agent
npm run build:api
npm run build:web
```

## 许可证

MIT
