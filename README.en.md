# ClawInc 云爪孵化器

🏢 **AI Agent Incubation Platform** — Create companies, recruit AI agents, and build your intelligent teams in a virtual park.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Tauri](https://img.shields.io/badge/Tauri-2.x-2ec4b6)

## Overview

ClawInc is an AI agent incubation management platform running on a dark-themed grid canvas. Users can create companies in the park, each automatically generating an AI CEO, and recruit more agents from the talent marketplace.

- 🌐 **Canvas View** — Drag to pan, scroll to zoom, dark grid background
- 🏢 **Company Creation** — Click an empty table, enter a company name, CEO is auto-generated
- 👥 **Company Panel** — View company members and organizational chart
- 🛒 **Talent Marketplace** — Recruit new agents to join your company
- 💾 **Persistent Storage** — SQLite on Tauri desktop, localStorage on web
- 🎨 **Status Animations** — Thinking agents display a pulsing ripple animation
- 🔗 **Org Chart Lines** — Dynamic connection lines from CEO to members in company panel

## Quick Start

### Web Development Mode

```bash
npm install
npm run dev
```

Visit http://localhost:5173

### Tauri Desktop App

```bash
npm install
npm run tauri dev      # Development mode
npm run tauri build    # Build for production
```

### Production Build (Web)

```bash
npm run build
```

Output goes to `dist/` directory.

## Project Structure

```
ClawInc/
├── src/                      # React frontend
│   ├── components/            # UI components
│   │   ├── ParkCanvas.tsx     # Park canvas (table grid)
│   │   ├── TableNode.tsx      # Single table node
│   │   ├── CompanyPanel.tsx   # Company detail panel
│   │   ├── TalentMarketplace.tsx  # Talent marketplace
│   │   ├── CreateCompanyModal.tsx # Create company modal
│   │   └── HireAgentModal.tsx     # Recruit agent modal
│   ├── store/
│   │   └── useParkStore.ts    # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       └── persistence.ts      # Persistence utilities
├── src-tauri/                 # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs             # Plugin registration
│   │   ├── main.rs            # Entry point
│   │   ├── commands.rs        # Tauri commands
│   │   └── db.rs              # SQLite operations
│   └── Cargo.toml
└── SPEC.md                    # Feature specification
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| State Management | Zustand 5 |
| Desktop App | Tauri 2.x |
| Backend Database | SQLite (via tauri-plugin-sql) |
| Automation | OpenClaw Agent System |

## Data Persistence

- **Desktop App**: Data stored at `~/Library/Application Support/com.clawinc.ClawInc/clawinc.db`
- **Web Version**: Uses localStorage, key: `clawinc-park-state`
- All state (tables, companies, agents) is auto-saved and persists across restarts

## License

MIT
