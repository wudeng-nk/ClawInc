import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Agent, Company, ParkState, Table } from '../types';
import { saveState, loadState, type PersistedState } from '../utils/persistence';

// ── Tauri detection ──────────────────────────────────────────────────────────
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
  return tauriInvoke<T>(cmd, args);
}

// ── DB field converters ──────────────────────────────────────────────────────
function parseSkills(v: string | null | undefined): string[] | undefined {
  if (v === null || v === undefined) return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed.split(',').filter(Boolean) : undefined;
}

function serializeSkills(v: string[] | undefined): string | undefined {
  return v?.length ? v.join(',') : undefined;
}

// ── Rust response → TypeScript types ─────────────────────────────────────────
interface RustCompany {
  id: string; name: string; table_id: string; ceo_id: string;
  agent_workspace: string; created_at: number;
}

interface RustAgent {
  id: string; company_id: string | null; name: string; role: string;
  avatar: string; status: string; session_key: string | null;
  bio: string | null; skills: string | null; openclaw_workspace: string | null;
  is_ceo: boolean; created_at: number;
}

interface CreateCompanyResult { company: RustCompany; ceo: RustAgent; }

function rustCompanyToTS(r: RustCompany): Company {
  return { id: r.id, name: r.name, tableId: r.table_id, ceoId: r.ceo_id, agents: [], groups: [], createdAt: r.created_at };
}

function rustAgentToTS(r: RustAgent): Agent {
  return {
    id: r.id, name: r.name, role: r.role, avatar: r.avatar,
    status: r.status as Agent['status'], companyId: r.company_id,
    sessionKey: r.session_key ?? undefined, bio: r.bio ?? undefined,
    skills: parseSkills(r.skills), openclawWorkspace: r.openclaw_workspace ?? undefined,
    isCeo: r.is_ceo,
  };
}

function makeInitialTables(): Table[] {
  return [
    { id: uuid(), status: 'empty', x: 300, y: 350 },
    { id: uuid(), status: 'empty', x: 700, y: 350 },
  ];
}

export interface HireAgentInput {
  name: string; role: string; avatar: string; bio?: string; skills?: string[];
}

interface ParkActions {
  createCompany: (tableId: string, name: string, ceoName: string, ceoAvatar: string) => Promise<Company>;
  createAgent: (companyId: string, input: HireAgentInput) => Promise<Agent>;
  recruitAgent: (input: Omit<HireAgentInput, never>) => Promise<Agent>;
  hireAgent: (agentId: string, companyId: string) => Promise<Agent>;
  removeAgent: (agentId: string) => Promise<void>;
  selectTable: (tableId: string | null) => void;
  setView: (view: 'park' | 'company' | 'talent') => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasZoom: (zoom: number) => void;
  getCompanyByTableId: (tableId: string) => Company | undefined;
  getTableById: (tableId: string) => Table | undefined;
  getAgentsByCompanyId: (companyId: string) => Agent[];
  hydrate: (persisted: PersistedState) => void;
  hydrateFromTauri: (tables: Table[], companies: Company[], agents: Agent[]) => void;
  triggerPersist: () => void;
}

export type ParkStore = ParkState & ParkActions;

export const useParkStore = create<ParkStore>((set, get) => ({
  tables: makeInitialTables(),
  companies: [],
  agents: [],
  selectedTableId: null,
  view: 'park',
  canvasOffset: { x: 0, y: 0 },
  canvasZoom: 1,

  createCompany: async (tableId, name, ceoName, ceoAvatar) => {
    const companyId = uuid();
    const ceoId = uuid();

    if (isTauri()) {
      const agentWorkspace = (process.env.HOME ?? '/Users/ai') + '/.openclaw/workspace-clawinc/companies/' + companyId;
      const input = {
        id: companyId, name, table_id: tableId, ceo_id: ceoId,
        ceo_name: ceoName, ceo_avatar: ceoAvatar,
        ceo_bio: null, ceo_skills: null, agent_workspace: agentWorkspace,
      };
      const result = await invoke<CreateCompanyResult>('create_company', { input });
      const company = rustCompanyToTS(result.company);
      const ceo = rustAgentToTS(result.ceo);
      // Populate company.agents so TableNode (which reads company.agents) can show the CEO avatar
      company.agents = [ceo];
      set((state) => ({
        tables: state.tables.map((t) => t.id === tableId ? { ...t, status: 'occupied' as const, companyId } : t),
        companies: [...state.companies, company],
        agents: [...state.agents, ceo],
        selectedTableId: tableId, view: 'company' as const,
      }));
      get().triggerPersist();
      return company;
    } else {
      // Web mode: workspace path is metadata-only, use a placeholder
      const agentWorkspace = '/tmp/workspace-clawinc/companies/' + companyId;
      try {
        const res = await fetch('/api/spawn-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspace: agentWorkspace, name }),
        });
        const result = await res.json();
        if (!result.success) console.warn('[createCompany] spawn agent failed:', result.error);
        else console.log('[createCompany] spawned OpenClaw agent:', ceoName);
      } catch (e) {
        console.warn('[createCompany] spawn agent error:', e);
      }
      const ceo: Agent = { id: ceoId, name: ceoName, role: 'CEO', avatar: ceoAvatar, status: 'idle', companyId, isCeo: true, openclawWorkspace: agentWorkspace };
      const company: Company = { id: companyId, name, tableId, ceoId, agents: [ceo], groups: [], createdAt: Date.now() };
      set((state) => ({
        tables: state.tables.map((t) => t.id === tableId ? { ...t, status: 'occupied' as const, companyId } : t),
        companies: [...state.companies, company],
        agents: [...state.agents, ceo],
        selectedTableId: tableId, view: 'company' as const,
      }));
      get().triggerPersist();
      return company;
    }
  },
  recruitAgent: async ({ name, role, avatar, bio, skills }) => {
    const id = uuid();
    if (isTauri()) {
      // Rust 'create_agent' command = recruit free agent to talent market
      const input = { id, name, role, avatar, bio: bio ?? null, skills: serializeSkills(skills), openclaw_workspace: null };
      const result = await invoke<RustAgent>('create_agent', { input });
      const agent = rustAgentToTS(result);
      set((state) => ({ agents: [...state.agents, agent] }));
      get().triggerPersist();
      return agent;
    } else {
      const agent: Agent = { id, name, role, avatar, status: 'idle', companyId: null, bio, skills, isCeo: false };
      set((state) => ({ agents: [...state.agents, agent] }));
      get().triggerPersist();
      return agent;
    }
  },

  createAgent: async (companyId, { name, role, avatar, bio, skills }) => {
    const id = uuid();
    if (isTauri()) {
      const input = { id, name, role, avatar, bio: bio ?? null, skills: serializeSkills(skills), openclaw_workspace: null };
      const result = await invoke<RustAgent>('create_agent', { input });
      const agent = rustAgentToTS(result);
      set((state) => ({ agents: [...state.agents, agent] }));
      get().triggerPersist();
      return agent;
    } else {
      const agent: Agent = { id, name, role, avatar, status: 'idle', companyId, bio, skills, isCeo: false };
      set((state) => ({ agents: [...state.agents, agent] }));
      get().triggerPersist();
      return agent;
    }
  },

  hireAgent: async (agentId, companyId) => {
    if (isTauri()) {
      const result = await invoke<RustAgent>('hire_agent', { agentId, companyId });
      const agent = rustAgentToTS(result);
      set((state) => ({ agents: state.agents.map((a) => a.id === agentId ? agent : a) }));
      get().triggerPersist();
      return agent;
    } else {
      set((state) => ({ agents: state.agents.map((a) => a.id === agentId ? { ...a, companyId, status: 'idle' as const } : a) }));
      get().triggerPersist();
      return get().agents.find((a) => a.id === agentId)!;
    }
  },

  removeAgent: async (agentId) => {
    if (isTauri()) await invoke<void>('delete_agent', { agentId });
    set((state) => ({ agents: state.agents.filter((a) => a.id !== agentId) }));
    get().triggerPersist();
  },

  selectTable: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table) return;
    if (table.status === 'occupied') set({ selectedTableId: tableId, view: 'company' });
    else set({ selectedTableId: tableId });
  },

  setView: (view) => { set({ view }); get().triggerPersist(); },
  setCanvasOffset: (offset) => { set({ canvasOffset: offset }); get().triggerPersist(); },
  setCanvasZoom: (zoom) => { set({ canvasZoom: Math.max(0.3, Math.min(2, zoom)) }); get().triggerPersist(); },

  getCompanyByTableId: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table?.companyId) return undefined;
    return get().companies.find((c) => c.id === table.companyId);
  },
  getTableById: (tableId) => get().tables.find((t) => t.id === tableId),
  getAgentsByCompanyId: (companyId) => get().agents.filter((a) => a.companyId === companyId),

  hydrate: (persisted) => {
    set({
      tables: persisted.tables as Table[], companies: persisted.companies as Company[],
      agents: persisted.agents as Agent[], selectedTableId: persisted.selectedTableId,
      view: persisted.view, canvasOffset: persisted.canvasOffset, canvasZoom: persisted.canvasZoom,
    });
  },
  hydrateFromTauri: (tables, companies, agents) => {
    // Populate company.agents so TableNode can display CEO avatar after reload
    const companiesWithAgents = companies.map(c => ({
      ...c,
      agents: agents.filter(a => a.companyId === c.id),
    }));
    set({ tables, companies: companiesWithAgents, agents });
  },
  triggerPersist: () => {
    // Save synchronously on meaningful state changes (company/agent CRUD)
    // to avoid data loss if the app closes before the debounce fires.
    const state = get();
    saveState({ tables: state.tables, companies: state.companies, agents: state.agents,
      selectedTableId: state.selectedTableId, view: state.view,
      canvasOffset: state.canvasOffset, canvasZoom: state.canvasZoom }).catch(console.warn);
  },
}));

// ── Startup ───────────────────────────────────────────────────────────────────
loadState().then(async (persisted) => {
  if (persisted && isTauri()) {
    try {
      const [companiesResult, agentsResult] = await Promise.all([
        invoke<RustCompany[]>('list_companies'),
        invoke<{ agents: Array<{ agent: RustAgent; company_name: string | null }> }>('list_all_agents'),
      ]);
      const tables = persisted.tables as Table[];
      const companies = (companiesResult as unknown as RustCompany[]).map(rustCompanyToTS);
      const agents = agentsResult.agents.map(({ agent }) => rustAgentToTS(agent));
      useParkStore.getState().hydrateFromTauri(tables, companies, agents);
      return;
    } catch (e) {
      console.warn('[useParkStore] Tauri load failed, using localStorage:', e);
    }
  }
  if (persisted) useParkStore.getState().hydrate(persisted);
});
