export function exportProject(state) {
  const { name, routes, nodes, mapCenter, mapZoom } = state
  const data = { name, routes, nodes, mapCenter, mapZoom, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch {
        reject(new Error('Ungültige JSON-Datei'))
      }
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsText(file)
  })
}

export function exportMaterialCSV(summary) {
  const lines = ['Typ,Name,Anzahl,Gesamtlänge (m)']
  for (const c of summary.cables) {
    lines.push(`Kabel,"${c.name}",${c.count},${Math.round(c.totalDistance)}`)
  }
  for (const d of summary.devices) {
    lines.push(`Gerät,"${d.name}",${d.count},`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'materialliste.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// --- Server API (only available in production Docker container) ---

export async function serverAvailable() {
  try {
    const res = await fetch('/api/projects', { signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch {
    return false
  }
}

export async function listServerProjects() {
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error('Server nicht erreichbar')
  return res.json()
}

export async function saveToServer(state) {
  const { name, routes, nodes, mapCenter, mapZoom } = state
  const data = { name, routes, nodes, mapCenter, mapZoom, savedAt: new Date().toISOString() }
  const res = await fetch(`/api/projects/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Speichern fehlgeschlagen')
}

export async function loadFromServer(name) {
  const res = await fetch(`/api/projects/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Projekt nicht gefunden')
  return res.json()
}

export async function deleteFromServer(name) {
  await fetch(`/api/projects/${encodeURIComponent(name)}`, { method: 'DELETE' })
}
