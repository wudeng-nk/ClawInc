import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Agent, Company, ParkState, Table } from '../types';

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

const INITIAL_TABLES: Table[] = [
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

interface ParkActions {
  createCompany: (tableId: string, name: string) => Company;
  selectTable: (tableId: string | null) => void;
  setView: (view: 'park' | 'company') => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasZoom: (zoom: number) => void;
  getCompanyByTableId: (tableId: string) => Company | undefined;
  getTableById: (tableId: string) => Table | undefined;
  getAgentsByCompanyId: (companyId: string) => Agent[];
}

export type ParkStore = ParkState & ParkActions;

export const useParkStore = create<ParkStore>((set, get) => ({
  tables: INITIAL_TABLES,
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

    return company;
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

  setView: (view) => set({ view }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.3, Math.min(2, zoom)) }),

  getCompanyByTableId: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table?.companyId) return undefined;
    return get().companies.find((c) => c.id === table.companyId);
  },

  getTableById: (tableId) => get().tables.find((t) => t.id === tableId),

  getAgentsByCompanyId: (companyId) => get().agents.filter((a) => a.companyId === companyId),
}));
