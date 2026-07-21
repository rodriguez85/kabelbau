import express from 'express'
import { createReadStream, mkdirSync, readdirSync, unlinkSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DATA_DIR = resolve(process.env.DATA_DIR ?? '/data')
const PORT = parseInt(process.env.PORT ?? '3000', 10)

mkdirSync(DATA_DIR, { recursive: true })

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.static(join(__dirname, 'dist')))

// Sanitize project name to prevent path traversal
const safe = (n) => n.replace(/[^a-zA-Z0-9äöüÄÖÜß_\-. ]/g, '_').slice(0, 120)

app.get('/api/projects', (_req, res) => {
  const names = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
  res.json(names)
})

app.get('/api/projects/:name', (req, res) => {
  const file = join(DATA_DIR, safe(req.params.name) + '.json')
  if (!existsSync(file)) return res.status(404).json({ error: 'Nicht gefunden' })
  res.type('json')
  createReadStream(file).pipe(res)
})

app.put('/api/projects/:name', (req, res) => {
  writeFileSync(join(DATA_DIR, safe(req.params.name) + '.json'), JSON.stringify(req.body, null, 2), 'utf8')
  res.json({ ok: true })
})

app.delete('/api/projects/:name', (req, res) => {
  const file = join(DATA_DIR, safe(req.params.name) + '.json')
  if (existsSync(file)) unlinkSync(file)
  res.json({ ok: true })
})

// SPA fallback
app.get('/{*path}', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () =>
  console.log(`Kabelbau läuft auf Port ${PORT} | Datenspeicher: ${DATA_DIR}`)
)
