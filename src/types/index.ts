export type AgentStatus = 'thinking' | 'idle' | 'offline';
export type TableStatus = 'empty' | 'occupied';

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string; // emoji
  status: AgentStatus;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  tableId: string;
  ceoId: string;
  agents: Agent[];
  groups: Group[];
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  companyId: string;
  memberIds: string[];
}

export interface Table {
  id: string;
  status: TableStatus;
  companyId?: string;
  x: number;
  y: number;
}

export interface ParkState {
  tables: Table[];
  companies: Company[];
  agents: Agent[];
  selectedTableId: string | null;
  view: 'park' | 'company';
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
}
