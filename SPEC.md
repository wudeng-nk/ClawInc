# Feature Specification: ClawInc 云爪孵化器 — Phase 2

**Feature Branch**: `feat/phase2-persistence`  
**Created**: 2026-03-29  
**Status**: In Progress  
**Input**: Phase 1 MVP 已完成 ✅ + Phase 2 用户反馈需求

---

## Phase 1 回顾

已完成功能：
- ✅ 暗色网格画布 + 拖拽平移/滚轮缩放
- ✅ 10张预设桌子（空桌虚线 + 占用桌显示公司名 + CEO头像）
- ✅ 点击空桌 → 创建公司弹窗（自动生成CEO）
- ✅ 公司面板（成员列表 + 统计卡片 + 返回园区）
- ✅ Web 构建 + Tauri 桌面应用编译（.app + .dmg）

---

## Phase 2 新功能

### User Story 5 — 状态持久化 (Priority: P1)

As a user, I close and reopen the app, and all my companies and agents are still there, so I don't lose progress.

**Why this priority**: Without persistence, every app restart wipes all data. Unacceptable for a "孵化器" product.

**Independent Test**: Create a company → close the app → reopen → company still visible on canvas → click it → all agents and data intact.

**Acceptance Scenarios**:
1. **Given** the app launches, **When** a persisted state file exists, **Then** the park store is hydrated from that file instead of initial state.
2. **Given** the user creates a company/agent, **When** the state changes, **Then** the state is automatically saved to the filesystem within 1 second.
3. **Given** the state file is corrupted, **When** the app launches, **Then** it falls back to initial state and logs an error.
4. **Given** the app runs in web mode, **When** it loads, **Then** it uses localStorage for persistence (Tauri filesystem only available in desktop).

**Technical Approach**:
- Use `@tauri-apps/plugin-fs` for Tauri desktop (Rust `tauri-plugin-fs` crate already in Cargo.toml but plugin not registered)
- Use `localStorage` for web fallback
- Persist full `ParkState` (tables, companies, agents, selectedTableId, view, canvasOffset, canvasZoom)
- Debounce saves by 500ms to avoid excessive writes

---

### User Story 6 — Agent Thinking Ripple 动画 (Priority: P2)

As a user, when an agent is "thinking", I see a pulsing ripple animation on their status indicator, so I know they're actively working.

**Why this priority**: Status indication is critical for "living" agent feel. Thinking without animation looks broken.

**Independent Test**: Set an agent status to `thinking` → blue ripple/pulse animation visible on the status dot → set to `idle` → animation stops.

**Acceptance Scenarios**:
1. **Given** an agent's status is `thinking`, **When** I look at their avatar in the table or company panel, **Then** a blue pulsing ring animation is visible.
2. **Given** an agent's status changes to `idle` or `offline`, **When** I look at them, **Then** the animation stops and only the static dot is shown.
3. **Given** the app has multiple thinking agents, **When** I view them, **Then** each has its own independent animation.

**Technical Approach**:
- CSS `@keyframes` ripple animation on the status indicator element
- Keyframes: scale 1→1.8, opacity 1→0, repeat infinite, duration 1.4s
- Color: `#60aaff` matching the thinking status color
- Apply in `TableNode.tsx` for canvas view and `CompanyPanel.tsx` for agent list

---

### User Story 7 — 动态连接线 (Priority: P2)

As a user, I see animated SVG connection lines from the CEO to other agents in the company panel, so I understand the organizational hierarchy.

**Why this priority**: Visual hierarchy makes the company feel alive and structured.

**Independent Test**: Open company panel with 3+ agents → animated dashed SVG lines animate from CEO to each other agent → lines have a "flowing" animation.

**Acceptance Scenarios**:
1. **Given** a company has a CEO and at least one other agent, **When** the company panel opens, **Then** SVG lines animate from CEO to each other agent.
2. **Given** a company only has a CEO, **When** the panel opens, **Then** no lines are drawn.
3. **Given** agents are added/removed, **When** the agent list changes, **Then** the SVG lines update to reflect the new topology.
4. **Given** the panel is open, **When** I resize the window, **Then** the lines reposition correctly.

**Technical Approach**:
- SVG overlay layer in `CompanyPanel.tsx`
- Position agents absolutely in a flex/grid layout, use `getBoundingClientRect()` to get pixel coordinates
- Lines: SVG `<path>` with `stroke-dasharray` + `stroke-dashoffset` animation for "flowing" effect
- Dashed line style, color `#4a4a8a`, animated offset

---

## Implementation Plan

1. **Persistence**:
   - Add `tauri-plugin-fs` to Cargo.toml dependencies
   - Register plugin in `src-tauri/src/lib.rs`
   - Add `fs` scope in Tauri capabilities config
   - Create `persistence.ts` utility (auto-detect Tauri vs web)
   - Integrate into `useParkStore` with subscribe + debounce

2. **Ripple Animation**:
   - Add CSS keyframes to `index.css`
   - Update `TableNode.tsx` status dot with animation class
   - Update `CompanyPanel.tsx` status dot with animation class

3. **Dynamic Connection Lines**:
   - Add SVG layer in `CompanyPanel.tsx`
   - Calculate agent positions after render (useEffect + setTimeout trick)
   - Draw animated `<path>` elements

---

## Files to Modify

- `src-tauri/Cargo.toml` — add `tauri-plugin-fs` dependency
- `src-tauri/src/lib.rs` — register fs plugin
- `src-tauri/capabilities/default.json` — add fs scope
- `src/store/useParkStore.ts` — persistence integration
- `src/components/TableNode.tsx` — ripple animation
- `src/components/CompanyPanel.tsx` — ripple + dynamic lines
- `src/index.css` — ripple keyframes
- `SPEC.md` — this file

---

## Success Criteria

- **SC-007**: Company created → app restarted → company still present on canvas (persistence)
- **SC-008**: Agent with `thinking` status shows pulsing blue ring animation
- **SC-009**: Company panel with CEO + agents shows animated connection lines
- **SC-010**: Both `npm run dev` and `npm run tauri dev` work without errors
