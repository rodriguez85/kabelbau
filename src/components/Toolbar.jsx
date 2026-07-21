import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import {
  exportProject, importProject,
  serverAvailable, listServerProjects, saveToServer, loadFromServer, deleteFromServer,
} from '../utils/projectIO'

export default function Toolbar() {
  const state = useProjectStore()
  const { name, setProjectName, loadProject, resetProject } = state
  const fileInputRef = useRef(null)

  const [hasServer, setHasServer] = useState(false)
  const [serverProjects, setServerProjects] = useState([])
  const [showServerList, setShowServerList] = useState(false)
  const [serverBusy, setServerBusy] = useState(false)

  // Detect server on mount
  useEffect(() => {
    serverAvailable().then((ok) => {
      setHasServer(ok)
      if (ok) refreshServerList()
    })
  }, [])

  async function refreshServerList() {
    try {
      const list = await listServerProjects()
      setServerProjects(list)
    } catch {}
  }

  async function handleSaveToServer() {
    setServerBusy(true)
    try {
      await saveToServer(state)
      await refreshServerList()
      setShowServerList(false)
    } catch (err) {
      alert('Server-Speichern fehlgeschlagen: ' + err.message)
    } finally {
      setServerBusy(false)
    }
  }

  async function handleLoadFromServer(projectName) {
    try {
      const data = await loadFromServer(projectName)
      loadProject(data)
      setShowServerList(false)
    } catch (err) {
      alert('Laden fehlgeschlagen: ' + err.message)
    }
  }

  async function handleDeleteFromServer(projectName) {
    if (!confirm(`"${projectName}" vom Server löschen?`)) return
    await deleteFromServer(projectName)
    await refreshServerList()
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importProject(file)
      loadProject(data)
    } catch (err) {
      alert('Import fehlgeschlagen: ' + err.message)
    }
    e.target.value = ''
  }

  function handleReset() {
    if (confirm('Alle Daten löschen und neues Projekt starten?')) resetProject()
  }

  return (
    <div className="h-12 bg-gray-900 text-white flex items-center px-4 gap-4 shadow-md flex-shrink-0 relative z-[1000]">
      <div className="flex items-center gap-2">
        <span className="text-blue-400 font-bold text-sm">⚡ Kabelbau</span>
        <span className="text-gray-600">|</span>
        <input
          value={name}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent text-sm text-gray-200 border-b border-gray-600 focus:border-blue-400 outline-none px-1 w-40"
          placeholder="Projektname"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {hasServer && (
          <>
            <span className="text-gray-600 text-xs">Server:</span>
            <button
              onClick={handleSaveToServer}
              disabled={serverBusy}
              className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded transition-colors disabled:opacity-50"
              title="Aktuelles Projekt auf dem Server speichern"
            >
              {serverBusy ? '…' : 'Speichern ↑'}
            </button>
            <div className="relative">
              <button
                onClick={() => { setShowServerList((v) => !v); refreshServerList() }}
                className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                title="Gespeicherte Projekte vom Server laden"
              >
                Projekte ↓
              </button>
              {showServerList && (
                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 min-w-48">
                  {serverProjects.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-2">Keine Projekte gespeichert</p>
                  ) : serverProjects.map((p) => (
                    <div key={p} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-700">
                      <button
                        onClick={() => handleLoadFromServer(p)}
                        className="flex-1 text-left text-xs text-gray-200 truncate"
                      >
                        {p}
                      </button>
                      <button
                        onClick={() => handleDeleteFromServer(p)}
                        className="text-red-400 hover:text-red-300 text-xs px-1"
                        title="Löschen"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-600">|</span>
          </>
        )}

        <button
          onClick={() => exportProject(state)}
          className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Exportieren
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Importieren
        </button>
        <button
          onClick={handleReset}
          className="text-xs px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded transition-colors"
        >
          Neu
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  )
}
