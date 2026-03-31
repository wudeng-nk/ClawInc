export type AgentStatus = 'thinking' | 'idle' | 'offline';
export type TableStatus = 'empty' | 'occupied';

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: AgentStatus;
  companyId: string | null;  // null = 待业
  sessionKey?: string;
  bio?: string;               // 个人简介
  skills?: string[];          // 能力列表
  openclawWorkspace?: string;
  isCeo: boolean;
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
  view: 'park' | 'company' | 'talent';
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
}

// 人才市场扩展信息
export interface MarketAgent extends Agent {
  companyName?: string;  // 雇主公司名，待业时为空
}
