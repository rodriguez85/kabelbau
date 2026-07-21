import { useState } from 'react'
import { useProjectStore } from '../../store/projectStore'
import devicesConfig from '../../config/devices.json'

export default function NodeModal({ node, onClose }) {
  const updateNode = useProjectStore((s) => s.updateNode)
  const deleteNode = useProjectStore((s) => s.deleteNode)
  const [name, setName] = useState(node.name)
  const [deviceType, setDeviceType] = useState(node.deviceType ?? '')

  function handleSave() {
    updateNode(node.id, { name, deviceType: deviceType || null })
    onClose()
  }

  function handleDelete() {
    if (confirm(`"${node.name}" löschen?`)) {
      deleteNode(node.id)
      onClose()
    }
  }

  const device = devicesConfig.devices.find((d) => d.id === deviceType)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-80 space-y-4">
        <h2 className="text-base font-semibold">
          {node.type === 'junction' ? 'Knotenpunkt bearbeiten' : 'Gerät bearbeiten'}
        </h2>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Bezeichnung</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>

        {node.type === 'device' && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Gerätetyp</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">– keiner –</option>
              {devicesConfig.devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.pairs != null ? ` (${d.pairs}P)` : ''}{d.inLine ? ' [in Linie]' : ''}
                </option>
              ))}
            </select>
            {device && (
              <p className="text-xs text-gray-400 mt-1">
                Kapazität: {device.pairs != null ? `${device.pairs} Aderpaare` : 'variabel'}
              </p>
            )}
          </div>
        )}

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
