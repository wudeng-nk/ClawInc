import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'

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
    const proc = spawn('openclaw', ['agents', 'list', '--json'], {
      cwd: process.env.HOME ?? '/Users/ai',
    })
    let stdout = ''
    proc.stdout.on('data', (d) => { stdout += d.toString() })
    proc.on('close', (code) => {
      resolve(code === 0 ? parseAgentsListOutput(stdout) : [])
    })
    proc.on('error', (e) => { console.warn('[openclaw-agents] spawn error:', e); resolve([]) })
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
      },
    },
  ],
})
