/**
 * Utilities for fetching OpenClaw agent configurations.
 * Used by the talent market to populate available talent from OpenClaw's configured agents.
 */

export interface OpenClawAgentConfig {
  id: string;
  identityName: string;
  identityEmoji: string;
  workspace: string;
  agentDir: string;
  model: string;
  bindings: number;
  isDefault: boolean;
}

let _invoke: typeof import('@tauri-apps/api/core').invoke | null = null;

async function getInvoke() {
  if (!_invoke) {
    _invoke = (await import('@tauri-apps/api/core')).invoke;
  }
  return _invoke;
}

/**
 * Fetch the list of all agents configured in OpenClaw.
 * Returns agents with their id, display name, emoji avatar, workspace, and model.
 */
export async function fetchOpenClawAgents(): Promise<OpenClawAgentConfig[]> {
  try {
    const invoke = await getInvoke();
    const agents = await invoke<OpenClawAgentConfig[]>('list_openclaw_agents');
    return agents;
  } catch (err) {
    console.error('[openclawAgents] Failed to fetch OpenClaw agents:', err);
    return [];
  }
}
