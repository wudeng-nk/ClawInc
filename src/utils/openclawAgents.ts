/**
 * Utilities for fetching OpenClaw agent configurations.
 * Used by the talent market to populate available talent from OpenClaw's configured agents.
 *
 * Web mode (dev): fetches from Vite proxy /api/openclaw-agents
 *   which runs `openclaw agents list --json` server-side.
 * Tauri mode (desktop): calls the list_openclaw_agents Tauri command.
 */

export interface OpenClawAgentConfig {
  id: string;
  identityName: string;
  identityEmoji: string;
  identitySource?: string;
  workspace: string;
  agentDir: string;
  model: string;
  bindings: number;
  isDefault: boolean;
  routes?: string[];
}

/**
 * Check if we're running inside a Tauri desktop app.
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

async function fetchViaTauri(): Promise<OpenClawAgentConfig[]> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<OpenClawAgentConfig[]>('list_openclaw_agents');
}

async function fetchViaWebProxy(): Promise<OpenClawAgentConfig[]> {
  const res = await fetch('/api/openclaw-agents');
  if (!res.ok) throw new Error(`web proxy ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Fetch the list of all agents configured in OpenClaw.
 */
export async function fetchOpenClawAgents(): Promise<OpenClawAgentConfig[]> {
  try {
    return isTauri() ? await fetchViaTauri() : await fetchViaWebProxy();
  } catch (err) {
    console.error('[openclawAgents] fetch failed:', err);
    return [];
  }
}
