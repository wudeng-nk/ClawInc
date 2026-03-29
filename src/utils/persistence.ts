import { writeTextFile, readTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appConfigDir } from '@tauri-apps/api/path';

const STATE_FILE = 'park-state.json';

let writeTimer: ReturnType<typeof setTimeout> | null = null;

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export type PersistedState = {
  tables: unknown[];
  companies: unknown[];
  agents: unknown[];
  selectedTableId: string | null;
  view: 'park' | 'company';
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
};

export async function saveState(state: PersistedState): Promise<void> {
  if (writeTimer !== null) {
    clearTimeout(writeTimer);
  }
  writeTimer = setTimeout(async () => {
    writeTimer = null;
    const json = JSON.stringify(state, null, 2);
    if (isTauri()) {
      try {
        const dir = await appConfigDir();
        const filePath = dir + STATE_FILE;
        const dirExists = await exists(dir);
        if (!dirExists) {
          await mkdir(dir, { recursive: true });
        }
        await writeTextFile(filePath, json);
        console.log('[persistence] State saved to', filePath);
      } catch (err) {
        console.error('[persistence] Failed to save state:', err);
      }
    } else {
      try {
        localStorage.setItem('clawinc-park-state', json);
        console.log('[persistence] State saved to localStorage');
      } catch (err) {
        console.error('[persistence] Failed to save state (localStorage):', err);
      }
    }
  }, 500);
}

export async function loadState(): Promise<PersistedState | null> {
  if (isTauri()) {
    try {
      const dir = await appConfigDir();
      const filePath = dir + STATE_FILE;
      const fileExists = await exists(filePath);
      if (!fileExists) {
        console.log('[persistence] No persisted state file found (Tauri)');
        return null;
      }
      const content = await readTextFile(filePath);
      const parsed = JSON.parse(content) as PersistedState;
      console.log('[persistence] State loaded from', filePath);
      return parsed;
    } catch (err) {
      console.error('[persistence] Failed to load state:', err);
      return null;
    }
  } else {
    try {
      const raw = localStorage.getItem('clawinc-park-state');
      if (!raw) {
        console.log('[persistence] No persisted state found (localStorage)');
        return null;
      }
      const parsed = JSON.parse(raw) as PersistedState;
      console.log('[persistence] State loaded from localStorage');
      return parsed;
    } catch (err) {
      console.error('[persistence] Failed to load state (localStorage):', err);
      return null;
    }
  }
}
