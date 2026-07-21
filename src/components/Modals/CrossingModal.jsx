import { useState } from 'react'
import crossingsConfig from '../../config/crossings.json'

function defaultCounts(cableType, sided) {
  const materials = crossingsConfig.materials[cableType] ?? []
  const mult = sided === 'beidseitig' ? 2 : 1
  return Object.fromEntries(materials.map((m) => [m.name, m.count * mult]))
}

export default function CrossingModal({ pending, onConfirm, onClose }) {
  const isEdit = !!pending.id
  const [name, setName] = useState(pending.name ?? 'Wegeübergang')
  const [sided, setSided] = useState(pending.sided ?? 'einseitig')
  const [counts, setCounts] = useState(() =>
    pending.customCounts ? { ...pending.customCounts } : defaultCounts(pending.cableType, pending.sided ?? 'einseitig')
  )

  const materials = crossingsConfig.materials[pending.cableType] ?? []

  function handleSidedChange(newSided) {
    setSided(newSided)
    setCounts(defaultCounts(pending.cableType, newSided))
  }

  function adjust(name, delta) {
    setCounts((prev) => ({ ...prev, [name]: Math.max(0, (prev[name] ?? 0) + delta) }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-80 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-gray-800 mb-4">Wegeübergang</h3>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Hochbau</label>
            <div className="mt-1 flex gap-2">
              {['einseitig', 'beidseitig'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSidedChange(opt)}
                  className={`flex-1 py-1.5 rounded text-sm font-medium border transition-colors
                    ${sided === opt ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {materials.length > 0 && (
          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Material</p>
            <table className="w-full text-xs">
              <tbody>
                {materials.map((m) => (
                  <tr key={m.name}>
                    <td className="py-0.5 text-gray-700 pr-2">{m.name}</td>
                    <td className="py-0.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => adjust(m.name, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold leading-none"
                        >−</button>
                        <span className="w-6 text-center font-semibold">{counts[m.name] ?? 0}</span>
                        <button
                          onClick={() => adjust(m.name, +1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold leading-none"
                        >+</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {materials.length === 0 && (
          <p className="text-xs text-gray-400 mb-4">
            Keine Materialdaten für Kabeltyp „{pending.cableType}" definiert.
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm({ name, sided, customCounts: counts })}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            {isEdit ? 'Speichern' : 'Einfügen'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
