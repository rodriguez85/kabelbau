import { useState } from 'react'
import { useProjectStore } from '../../store/projectStore'
import cablesConfig from '../../config/cables.json'

const COLORS = ['#15803d', '#1d4ed8', '#b91c1c', '#d97706', '#7c3aed', '#0891b2', '#000000']

export default function RouteModal({ route, onClose }) {
  const updateRoute = useProjectStore((s) => s.updateRoute)
  const deleteRoute = useProjectStore((s) => s.deleteRoute)
  const [name, setName] = useState(route.name)
  const [cableType, setCableType] = useState(route.cableType)
  const [color, setColor] = useState(route.color ?? '')

  function handleSave() {
    const cable = cablesConfig.cables.find((c) => c.id === cableType)
    updateRoute(route.id, {
      name,
      cableType,
      color: color || null,
      cablesNeeded: cable ? Math.ceil((route.distanceM ?? 0) / cable.lengthM) : route.cablesNeeded,
    })
    onClose()
  }

  function handleDelete() {
    if (confirm(`Strecke "${route.name}" löschen?`)) {
      deleteRoute(route.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-80 space-y-4">
        <h2 className="text-base font-semibold">Strecke bearbeiten</h2>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Kabeltyp</label>
          <select
            value={cableType}
            onChange={(e) => setCableType(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {cablesConfig.cables.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.pairs}P, {c.lengthM}m)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Linienfarbe <span className="text-gray-400">(leer = Kabeltyp-Farbe)</span>
          </label>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setColor('')}
              className={`w-6 h-6 rounded border-2 text-xs ${!color ? 'border-blue-500' : 'border-gray-200'}`}
              title="Standard"
            >A</button>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded border-2 ${color === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          Länge: {Math.round(route.distanceM ?? 0)} m ·{' '}
          {Math.ceil((route.distanceM ?? 0) / (cablesConfig.cables.find((c) => c.id === cableType)?.lengthM ?? 1))}×{' '}
          {cablesConfig.cables.find((c) => c.id === cableType)?.name}
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white rounded py-1.5 text-sm hover:bg-blue-700">
            Speichern
          </button>
          <button onClick={handleDelete} className="px-3 bg-red-100 text-red-700 rounded py-1.5 text-sm hover:bg-red-200">
            Löschen
          </button>
          <button onClick={onClose} className="px-3 bg-gray-100 text-gray-700 rounded py-1.5 text-sm hover:bg-gray-200">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
