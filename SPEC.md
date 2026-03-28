# Feature Specification: ClawInc 云爪孵化器 — Phase 1 MVP

**Feature Branch**: `feat/phase1-mvp`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: ClawInc 云爪孵化器 product design doc (v2.0, 2026-03-24) + React + Vite + Tauri tech stack

---

## User Scenarios & Testing

### User Story 1 — Enter Park and See Tables (Priority: P1)

As a user, I open ClawInc and see an infinite dark canvas with preset tables distributed across it, so I understand this is a space where I can create and manage companies.

**Why this priority**: This is the foundational experience — without it, users cannot orient themselves in the product.

**Independent Test**: Open the app → canvas renders with visible grid background → 6–12 tables visible in initial viewport → empty tables show dashed "待入驻" border → occupied tables show company name + CEO avatar.

**Acceptance Scenarios**:
1. **Given** the app launches, **When** the park view loads, **Then** a dark grid canvas with pan/zoom (Figma-like) is visible.
2. **Given** tables are rendered, **When** a table is empty, **Then** it shows a dashed border with a subtle "+" icon.
3. **Given** a table is occupied, **When** I look at it, **Then** I see company name, logo placeholder, and CEO avatar.

---

### User Story 2 — Create a Company (Priority: P1)

As a user, I click an empty table and create a company, so I can start building my digital enterprise.

**Why this priority**: Company creation is the core loop entry point — without this, nothing else matters.

**Independent Test**: Click empty table → "创建公司" modal appears → enter "云爪科技" → confirm → table becomes occupied showing "云爪科技" + CEO avatar → company panel opens automatically.

**Acceptance Scenarios**:
1. **Given** I am on the park view, **When** I click an empty table, **Then** a "创建公司" dialog/modal opens with a company name input.
2. **Given** the dialog is open, **When** I enter a company name and confirm, **Then** the table status changes to occupied, a CEO agent is auto-generated, and the company management panel opens.
3. **Given** a company is created, **When** I look at its table, **Then** it shows the company name, a default logo, and the CEO's avatar.
4. **Given** a company is created, **When** I return to the park view, **Then** the other empty tables remain unchanged.

---

### User Story 3 — View Company Panel (Priority: P1)

As a user, I click an occupied table and see the company management panel with agent roster, so I understand my company's current state.

**Why this priority**: The panel is the primary interface for all company operations — hiring, firing, group management.

**Independent Test**: Click occupied table → company panel opens with left sidebar (agent list with CEO at top) and main area (company stats:沟通摘要, 任务量, 活跃度, 每日进展).

**Acceptance Scenarios**:
1. **Given** a company exists, **When** I click its table, **Then** a back-to-park breadcrumb appears and the company panel renders with agent list sidebar and stats area.
2. **Given** the company panel is open, **When** I look at the agent list, **Then** the CEO agent is listed first with a crown icon, followed by hired agents.
3. **Given** the company panel is open, **When** I look at the stats area, **Then** I see placeholder cards for 沟通摘要, 任务量, 活跃度, and 每日进展 (empty state until agents perform work).

---

### User Story 4 — Return to Park (Priority: P2)

As a user, I want to navigate back to the park view from a company panel, so I can manage multiple companies.

**Why this priority**: Multi-company management requires reliable navigation between park and company contexts.

**Independent Test**: In company panel, click "← 返回园区" → park view renders with all tables in their current state.

**Acceptance Scenarios**:
1. **Given** I am in a company panel, **When** I click the back button, **Then** I return to the park view and all table states are preserved.

---

### Edge Cases

- What happens when the user tries to create a company with an empty name? → Show validation error, do not create.
- What happens when all tables are occupied? → Show "园区已满" indicator; no additional companies can be created in Phase 1.
- What happens when the CEO agent fails to generate? → Show error toast; table remains in empty state.
- What happens if the canvas is panned far away from any tables? → Canvas supports edge pan-back; tables are always reachable.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST render an infinite pan/zoom canvas with dark industrial grid background.
- **FR-002**: System MUST display 6–12 preset table positions on the canvas at startup.
- **FR-003**: System MUST distinguish empty tables (dashed border + "+" icon) from occupied tables (company info displayed).
- **FR-004**: System MUST allow clicking an empty table to open a "创建公司" dialog.
- **FR-005**: System MUST auto-generate a CEO agent with a random name and avatar when a company is created.
- **FR-006**: System MUST persist park state (tables, companies, agents) across app restarts using Tauri's filesystem API.
- **FR-007**: System MUST open company panel (with agent list + stats area) when clicking an occupied table.
- **FR-008**: System MUST navigate back to park view via a back button in the company panel.
- **FR-009**: Agent status MUST be one of: `thinking` (with ripple animation), `idle` (static), `offline` (greyed out).
- **FR-010**: System MUST show SVG animated connection lines from CEO to agents when a task is dispatched (Phase 1: static placeholder lines).
- **FR-011**: The app MUST run as both a web app (Vite dev server, port 5173) and a desktop app (Tauri).
- **FR-012**: All entity state (Park, Table, Company, Agent, Group) MUST be stored in a Zustand store (`useParkStore`).

### Key Entities

- **Park**: The root canvas container. Contains an array of Tables. Has a fixed grid background.
- **Table**: Represents one company's slot. Fields: `id` (UUID), `status` (empty | occupied), `companyId` (if occupied).
- **Company**: A business unit. Fields: `id`, `name`, `tableId`, `ceoId`, `agents[]`, `groups[]`, `createdAt`.
- **Agent**: A digital employee. Fields: `id`, `name`, `role`, `avatar`, `status` (thinking | idle | offline), `companyId`.
- **Group**: A team chat. Fields: `id`, `name`, `companyId`, `memberIds[]`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can create a company and see it rendered on the canvas within 10 seconds of clicking "确认".
- **SC-002**: Company panel displays within 500ms of clicking an occupied table.
- **SC-003**: Canvas supports smooth pan (60fps) and zoom without layout jank.
- **SC-004**: App state persists correctly across a full restart (companies, agents, tables all restored).
- **SC-005**: Both `npm run dev` (web) and `npm run tauri dev` (desktop) build and launch without errors.
- **SC-006**: Phase 1 delivers a working park view + company creation + company panel as a coherent user journey.
