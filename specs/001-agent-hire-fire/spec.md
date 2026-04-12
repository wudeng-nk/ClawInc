# Feature Specification: Agent Hire & Fire

**Feature Branch**: `001-agent-hire-fire`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "创建agent入职和解雇功能：增加入职和解雇两个按钮；入职则创建一个agent弹窗，填写必要信息（name/role/avatar），完成后通过OpenClaw方式创建一个agent；解雇则选择agent后确认删除"

## User Scenarios & Testing

### User Story 1 - Hire a New Agent (Priority: P1)

As a user, I click the "入职" button in the company panel, fill in the agent's information (name, role, avatar), and the agent is created and added to the company roster.

**Why this priority**: Hiring agents is the core mechanic for growing a company — without it, there's no progression.

**Independent Test**: Open company panel → click "入职" → fill in name, role, select avatar → confirm → agent appears in the member list with "idle" status.

**Acceptance Scenarios**:

1. **Given** I am in the company panel, **When** I click the "入职" button, **Then** a "入职" modal opens with input fields for name, role, and avatar selection.
2. **Given** the hire modal is open, **When** I fill in a name, select a role (e.g. "工程师", "设计师"), and pick an avatar emoji, **Then** the confirm button becomes enabled.
3. **Given** I fill in all required fields and click "确认", **Then** a new agent is created with the entered name, role, and avatar, added to the company's agent list, and the modal closes.
4. **Given** I click "取消" or the backdrop, **When** the modal is open, **Then** the modal closes and no agent is created.
5. **Given** the hire modal is open, **When** I leave the name field empty, **Then** the confirm button remains disabled (validation error shown).

---

### User Story 2 - Fire an Agent (Priority: P1)

As a user, I click the "解雇" button, select an agent from the company roster, confirm, and the agent is removed from the company.

**Why this priority**: Managing team size and replacing underperforming agents is essential for the "孵化器" fantasy.

**Independent Test**: Open company panel → click "解雇" → click on an agent (not the CEO) → confirm deletion → agent disappears from the member list.

**Acceptance Scenarios**:

1. **Given** I am in the company panel, **When** I click the "解雇" button, **Then** the agent list enters "selection mode" with each non-CEO agent showing a highlight/focus state.
2. **Given** I am in selection mode, **When** I click on a non-CEO agent, **Then** the agent is highlighted and a confirmation prompt appears ("确认解雇 [AgentName]？").
3. **Given** the confirmation prompt is shown, **When** I click "确认", **Then** the agent is removed from the company, the agent list updates, and selection mode exits.
4. **Given** the confirmation prompt is shown, **When** I click "取消", **Then** the confirmation closes and I remain in selection mode.
5. **Given** I am in selection mode, **When** I click the "×" or press Escape, **Then** selection mode exits without changes.
6. **Given** the CEO is selected for firing, **When** I try to confirm, **Then** the system shows an error message "CEO cannot be fired" and the confirmation is blocked.
7. **Given** there is only the CEO in the company, **When** I enter selection mode, **Then** I see a message "无可解雇成员" and selection mode exits immediately.

---

## Requirements

### Functional Requirements

- **FR-001**: Company panel MUST display an "入职" button (primary action) in the header or toolbar area.
- **FR-002**: Company panel MUST display a "解雇" button (destructive action) near or alongside the "入职" button.
- **FR-003**: Clicking "入职" MUST open a modal dialog titled "入职新成员" with fields: 姓名 (text), 职位/角色 (text), 头像 (emoji picker or preset emoji grid).
- **FR-004**: All three fields (name, role, avatar) MUST be required. Confirm button is disabled until all fields are filled.
- **FR-005**: On confirm, the new agent MUST be persisted via `useParkStore.createAgent(companyId, name, role, avatar)` and appear immediately in the member list with status "idle".
- **FR-006**: Clicking "解雇" enters agent selection mode — non-CEO agents display a red-tinted highlight or border to indicate selection affordance.
- **FR-007**: Tapping a highlighted agent shows a confirmation dialog with the agent's name and avatar.
- **FR-008**: Confirming deletion calls `useParkStore.removeAgent(agentId)` — agent is removed from `agents` array and from the company roster.
- **FR-009**: CEO agents MUST NOT be selectable for firing. Attempting to fire the CEO shows an error message.
- **FR-010**: If only the CEO exists, clicking "解雇" shows an empty-state message and exits selection mode immediately.
- **FR-011**: "入职" and "解雇" buttons MUST NOT be visible when the company panel is not open.

### Key Entities

- **Agent**: Represents a digital employee. Fields: `id` (UUID), `name` (string), `role` (string, e.g. "工程师"), `avatar` (emoji string), `status` (idle | thinking | offline), `companyId` (UUID).
- **Company**: Contains an array of agents. The agent list in the sidebar is derived from `agents.filter(a => a.companyId === company.id)`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can successfully hire a new agent (fill form + confirm) within 30 seconds.
- **SC-002**: Hired agent appears in the member list immediately after confirmation with correct name, role, and avatar.
- **SC-003**: User can fire (select + confirm) a non-CEO agent and see them removed from the list within 10 seconds.
- **SC-004**: Attempting to fire the CEO is blocked with a visible error message.
- **SC-005**: "入职" and "解雇" buttons do not appear in the park view (only in company panel).
