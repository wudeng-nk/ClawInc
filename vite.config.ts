import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { mkdirSync } from 'fs'

function parseAgentsListOutput(stdout: string): any[] {
  try {
    const start = stdout.indexOf('[')
    if (start === -1) return []
    let depth = 0
    let end = start
    for (let i = 0; i < stdout.slice(start).length; i++) {
      const c = stdout[start + i]
      if (c === '[') depth++
      else if (c === ']') { depth--; if (depth === 0) { end = start + i + 1; break } }
    }
    return JSON.parse(stdout.slice(start, end))
  } catch (e) {
    console.warn('[openclaw-agents] parse error:', e)
    return []
  }
}

function runOpenClawAgentsList(): Promise<any[]> {
  return new Promise((resolve) => {
    const proc = spawn('openclaw', ['agents', 'list', '--json'], { cwd: process.env.HOME ?? '/Users/ai' })
    let stdout = ''
    proc.stdout.on('data', (d) => { stdout += d.toString() })
    proc.on('close', (code) => { resolve(code === 0 ? parseAgentsListOutput(stdout) : []) })
    proc.on('error', () => resolve([]))
  })
}

function runOpenClawAgentsAdd(workspace: string, name: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try { mkdirSync(workspace, { recursive: true }) } catch {}
    const proc = spawn('openclaw', ['agents', 'add', '--workspace', workspace, '--non-interactive', '--json', name], { cwd: process.env.HOME ?? '/Users/ai' })
    let stderr = ''
    proc.stderr.on('data', (d) => { stderr += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve({ success: true })
      else resolve({ success: false, error: stderr || `exit ${code}` })
    })
    proc.on('error', (e) => resolve({ success: false, error: String(e) }))
  })
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'openclaw-agents',
      configureServer(server) {
        server.middlewares.use('/api/openclaw-agents', async (_req, res) => {
          const agents = await runOpenClawAgentsList()
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify(agents))
        })

        server.middlewares.use('/api/spawn-agent', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end('POST only'); return }
          let body = ''
          req.on('data', (d) => { body += d.toString() })
          req.on('end', async () => {
            try {
              const { workspace, name } = JSON.parse(body)
              if (!workspace || !name) { res.statusCode = 400; res.end(JSON.stringify({ error: 'workspace and name required' })); return }
              const result = await runOpenClawAgentsAdd(workspace, name)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify(result))
            } catch (e: any) {
              res.statusCode = 500; res.end(JSON.stringify({ error: e.message }))
            }
          })
        })
      },
    },
  ],
})
