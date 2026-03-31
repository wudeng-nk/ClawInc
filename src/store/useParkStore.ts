import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Agent, Company, ParkState, Table } from '../types';
import { saveState, loadState, type PersistedState } from '../utils/persistence';

const CEO_FIRST_NAMES = ['阿尔瓦', '塞巴斯', '米开朗', '利昂', '艾琳', '洛奇', '薇拉', '诺亚', '艾登', '珊娜'];
const CEO_LAST_NAMES = ['·洛克菲勒', '·斯特恩', '·克莱因', '·贝尔蒙', '·格兰特', '·文森特', '·艾什', '·诺克斯', '·雷顿', '·谢菲尔德'];
const AVATARS = ['🦁', '🦊', '🐯', '🐺', '🦅', '🐉', '🦅', '🐲', '🦉', '🐰'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCEO(companyId: string): Agent {
  const firstName = randomItem(CEO_FIRST_NAMES);
  const lastName = randomItem(CEO_LAST_NAMES);
  return {
    id: uuid(),
    name: firstName + lastName,
    role: 'CEO',
    avatar: randomItem(AVATARS),
    status: 'idle',
    companyId,
  };
}

function makeInitialTables(): Table[] {
  return [
    { id: uuid(), status: 'empty', x: 200, y: 200 },
    { id: uuid(), status: 'empty', x: 500, y: 150 },
    { id: uuid(), status: 'empty', x: 800, y: 200 },
    { id: uuid(), status: 'empty', x: 350, y: 450 },
    { id: uuid(), status: 'empty', x: 650, y: 420 },
    { id: uuid(), status: 'empty', x: 950, y: 450 },
    { id: uuid(), status: 'empty', x: 150, y: 700 },
    { id: uuid(), status: 'empty', x: 500, y: 680 },
    { id: uuid(), status: 'empty', x: 820, y: 700 },
    { id: uuid(), status: 'empty', x: 1100, y: 300 },
  ];
}

export interface HireAgentInput {
  name: string;
  role: string;
  avatar: string;
}

interface ParkActions {
  createCompany: (tableId: string, name: string) => Company;
  createAgent: (companyId: string, input: HireAgentInput) => Agent;
  removeAgent: (agentId: string) => void;
  selectTable: (tableId: string | null) => void;
  setView: (view: 'park' | 'company') => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasZoom: (zoom: number) => void;
  getCompanyByTableId: (tableId: string) => Company | undefined;
  getTableById: (tableId: string) => Table | undefined;
  getAgentsByCompanyId: (companyId: string) => Agent[];
  hydrate: (persisted: PersistedState) => void;
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

  createCompany: (tableId, name) => {
    const companyId = uuid();
    const ceo = generateCEO(companyId);
    const company: Company = {
      id: companyId,
      name,
      tableId,
      ceoId: ceo.id,
      agents: [ceo],
      groups: [],
      createdAt: Date.now(),
    };

    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'occupied' as const, companyId } : t
      ),
      companies: [...state.companies, company],
      agents: [...state.agents, ceo],
      selectedTableId: tableId,
      view: 'company' as const,
    }));

    get().triggerPersist();
    return company;
  },

  createAgent: (companyId, { name, role, avatar }) => {
    const agent: Agent = {
      id: uuid(),
      name,
      role,
      avatar,
      status: 'idle',
      companyId,
    };

    set((state) => ({
      agents: [...state.agents, agent],
    }));

    get().triggerPersist();
    return agent;
  },

  removeAgent: (agentId) => {
    const agent = get().agents.find((a) => a.id === agentId);
    if (!agent) return;

    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
    }));

    get().triggerPersist();
  },

  selectTable: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table) return;
    if (table.status === 'occupied') {
      set({ selectedTableId: tableId, view: 'company' });
    } else {
      set({ selectedTableId: tableId });
    }
  },

  setView: (view) => {
    set({ view });
    get().triggerPersist();
  },

  setCanvasOffset: (offset) => {
    set({ canvasOffset: offset });
    get().triggerPersist();
  },

  setCanvasZoom: (zoom) => {
    set({ canvasZoom: Math.max(0.3, Math.min(2, zoom)) });
    get().triggerPersist();
  },

  getCompanyByTableId: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table?.companyId) return undefined;
    return get().companies.find((c) => c.id === table.companyId);
  },

  getTableById: (tableId) => get().tables.find((t) => t.id === tableId),

  getAgentsByCompanyId: (companyId) => get().agents.filter((a) => a.companyId === companyId),

  hydrate: (persisted) => {
    set({
      tables: persisted.tables as Table[],
      companies: persisted.companies as Company[],
      agents: persisted.agents as Agent[],
      selectedTableId: persisted.selectedTableId,
      view: persisted.view,
      canvasOffset: persisted.canvasOffset,
      canvasZoom: persisted.canvasZoom,
    });
  },

  triggerPersist: () => {
    const state = get();
    saveState({
      tables: state.tables,
      companies: state.companies,
      agents: state.agents,
      selectedTableId: state.selectedTableId,
      view: state.view,
      canvasOffset: state.canvasOffset,
      canvasZoom: state.canvasZoom,
    });
  },
}));

loadState().then((persisted) => {
  if (persisted) {
    useParkStore.getState().hydrate(persisted);
  }
});
