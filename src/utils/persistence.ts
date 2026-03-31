// Dynamic import guard for Tauri APIs - only loaded when in Tauri context
let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let tauriPath: typeof import('@tauri-apps/api/path') | null = null;

async function loadTauriApis() {
  if (typeof window === 'undefined' || !('__TAURI__' in window)) {
    return false;
  }
  if (!tauriFs) {
    try {
      tauriFs = await import('@tauri-apps/plugin-fs');
      tauriPath = await import('@tauri-apps/api/path');
      return true;
    } catch {
      console.warn('[persistence] Failed to load Tauri APIs, using localStorage');
      return false;
    }
  }
  return true;
}


const STATE_FILE = 'park-state.json';

let writeTimer: ReturnType<typeof setTimeout> | null = null;

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
    
    const hasTauri = await loadTauriApis();
    if (hasTauri && tauriFs && tauriPath) {
      try {
        const dir = await tauriPath.appConfigDir();
        const filePath = dir + STATE_FILE;
        const dirExists = await tauriFs.exists(dir);
        if (!dirExists) {
          await tauriFs.mkdir(dir, { recursive: true });
        }
        await tauriFs.writeTextFile(filePath, json);
        console.log('[persistence] State saved to', filePath);
      } catch (err) {
        console.error('[persistence] Failed to save state (Tauri):', err);
        // Fallback to localStorage
        try {
          localStorage.setItem('clawinc-park-state', json);
        } catch {}
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
  const hasTauri = await loadTauriApis();
  
  if (hasTauri && tauriFs && tauriPath) {
    try {
      const dir = await tauriPath.appConfigDir();
      const filePath = dir + STATE_FILE;
      const fileExists = await tauriFs.exists(filePath);
      if (!fileExists) {
        console.log('[persistence] No persisted state file found (Tauri)');
        // Try localStorage as fallback
        return loadFromLocalStorage();
      }
      const content = await tauriFs.readTextFile(filePath);
      const parsed = JSON.parse(content) as PersistedState;
      console.log('[persistence] State loaded from', filePath);
      return parsed;
    } catch (err) {
      console.error('[persistence] Failed to load state (Tauri):', err);
      // Fallback to localStorage
      return loadFromLocalStorage();
    }
  } else {
    return loadFromLocalStorage();
  }
}

function loadFromLocalStorage(): PersistedState | null {
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

