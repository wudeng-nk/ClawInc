# ClawInc Constitution

## Core Principles

### I. Simulation-First Experience
Every interaction MUST be designed around the "Park → Table → Company → Agent" visual metaphor. The simulation metaphor is not decoration — it IS the UX. Users manage their digital enterprise through familiar business simulation idioms (hire/fire, busy/idle, team chat, daily reports) rather than abstract agent configuration.

### II. Zero-Config Agent Onboarding
Hiring an Agent MUST require no more than three clicks. Agent templates (role presets) provide instant personality and capability scaffolding. Configuration complexity MUST be hidden behind template selection — users see "Data Analyst" not YAML files.

### III. Tauri + React + Vite Full-Stack Unity
Frontend and desktop runtime share a single codebase. React components for UI, Tauri for native capabilities (filesystem, OpenClaw integration, system tray), Vite for fast HMR in both web and desktop contexts. No platform-specific feature branches.

### IV. State-Driven Architecture
All park/table/company/agent state lives in a Zustand store (useParkStore). UI is a pure function of state. No ad-hoc local state for core entities. State changes drive all visual updates including agent status animations and SVG communication lines.

### V. Progressive Feature Disclosure
The product ships in phased milestones (Phase 1 MVP → Phase 4 Enterprise). Each phase is independently testable and deliverable. Phase 1 MUST include: infinite canvas + table rendering + company creation + CEO agent auto-generation + basic agent roster.

## Additional Constraints

### Technology Stack
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, Framer Motion
- **Build Tool**: Vite 5+
- **Desktop Runtime**: Tauri 2.x (Rust backend)
- **State Management**: Zustand with persist middleware
- **OpenClaw Integration**: Tauri-side file system operations for agent config read/write

### Data Model Constraints
- Park, Table, Company, Agent, Group entities MUST have UUID identifiers
- Agent status enum: thinking | idle | offline — no custom status strings
- CEO agent MUST NOT be deletable while company exists
- Table status enum: empty | occupied — no third state

## Development Workflow

### Phase-Gated Development
All work is organized by Phase milestone. Features not in the current phase MUST NOT block merge. Technical debt introduced by shortcut decisions MUST be logged in `.specify/memory/phase-N-tech-debt.md`.

### Testing Requirements
- Phase 1 features MUST have unit tests (Vitest + React Testing Library)
- Phase 2+ features MUST have integration tests for cross-component state interactions
- E2E tests (Playwright) REQUIRED for critical user journeys: company creation, agent hire, agent fire

## Governance

This constitution supersedes all ad-hoc development practices. Any deviation from Core Principles I–V MUST be approved via a documented amendment in `.specify/memory/constitution-amendments.md` with migration plan.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
