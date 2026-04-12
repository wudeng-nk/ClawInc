# ClawInc 云爪孵化器

🏢 **AI Agent 孵化平台** — 在虚拟园区中创建公司、招募 AI Agent、构建你的智能团队。

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Tauri](https://img.shields.io/badge/Tauri-2.x-2ec4b6)

## 项目简介

ClawInc 云爪孵化器是一个 AI Agent 孵化管理平台，运行在暗色网格画布上。用户可以在园区中创建公司，每家公司自动生成一名 AI CEO，并可从人才市场招募更多 Agent 成员。

- 🌐 **画布视图** — 拖拽平移、滚轮缩放，暗色网格背景
- 🏢 **公司创建** — 点击空桌，输入公司名称，自动生成 CEO
- 👥 **公司面板** — 查看公司成员、组织架构图
- 🛒 **人才市场** — 招募新 Agent 加入公司
- 💾 **持久化存储** — Tauri 桌面版使用 SQLite，Web 版使用 localStorage
- 🎨 **状态动画** — Thinking 状态的 Agent 有脉冲涟漪动画
- 🔗 **组织架构线** — 公司面板中 CEO 到成员的动态连线

## 快速开始

### Web 开发模式

```bash
npm install
npm run dev
```

访问 http://localhost:5173

### Tauri 桌面应用

```bash
npm install
npm run tauri dev      # 开发模式
npm run tauri build    # 构建生产版本
```

### 生产构建（Web）

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 项目结构

```
ClawInc/
├── src/                      # React 前端
│   ├── components/            # UI 组件
│   │   ├── ParkCanvas.tsx     # 园区画布（桌子网格）
│   │   ├── TableNode.tsx      # 单张桌子节点
│   │   ├── CompanyPanel.tsx   # 公司详情面板
│   │   ├── TalentMarketplace.tsx  # 人才市场
│   │   ├── CreateCompanyModal.tsx # 创建公司弹窗
│   │   └── HireAgentModal.tsx     # 招募 Agent 弹窗
│   ├── store/
│   │   └── useParkStore.ts    # Zustand 状态管理
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   └── utils/
│       └── persistence.ts      # 持久化工具
├── src-tauri/                 # Tauri/Rust 后端
│   ├── src/
│   │   ├── lib.rs             # 插件注册
│   │   ├── main.rs            # 入口
│   │   ├── commands.rs        # Tauri 命令
│   │   └── db.rs              # SQLite 操作
│   └── Cargo.toml
└── SPEC.md                    # 功能规格文档
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 状态管理 | Zustand 5 |
| 桌面应用 | Tauri 2.x |
| 后端数据库 | SQLite (via tauri-plugin-sql) |
| 自动化 | OpenClaw Agent System |

## 数据持久化

- **桌面应用**: 数据存储在 `~/Library/Application Support/com.clawinc.ClawInc/clawinc.db`
- **Web 版本**: 使用 localStorage，键名为 `clawinc-park-state`
- 所有状态（桌子、公司、Agent）自动保存，关闭/重启后数据保留

## License

MIT
