import cablesConfig from '../../config/cables.json'
import devicesConfig from '../../config/devices.json'

const TOOLS = [
  { id: 'select', label: 'Auswählen', icon: '↖' },
  { id: 'cable', label: 'Strecke zeichnen', icon: '✏' },
  { id: 'device', label: 'Gerät platzieren', icon: '📍' },
  { id: 'junction', label: 'Knotenpunkt', icon: '⊕' },
  { id: 'delete', label: 'Löschen', icon: '🗑' },
]

export default function ToolPanel({ activeTool, setActiveTool, selectedCableType, setSelectedCableType, selectedDeviceType, setSelectedDeviceType }) {
  return (
    <div className="p-3 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Werkzeug</p>
        <div className="flex flex-col gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors
                ${activeTool === t.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
            >
              <span className="w-5 text-center">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTool === 'cable' && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Kabeltyp</p>
          <div className="flex flex-col gap-1">
            {cablesConfig.cables.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCableType(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors
                  ${selectedCableType === c.id ? 'ring-2 ring-offset-1 font-semibold' : 'hover:bg-gray-100'}`}
                style={selectedCableType === c.id ? { ringColor: c.color, backgroundColor: c.color + '22' } : {}}
              >
                <span
                  className="w-4 h-4 rounded-sm border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>
                  {c.name}
                  <span className="text-gray-400 text-xs ml-1">({c.lengthM} m, {c.pairs}P)</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Klicken = Punkt setzen · Doppelklick = Abschließen</p>
        </div>
      )}

      {activeTool === 'device' && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Gerätetyp</p>
          <div className="flex flex-col gap-1">
            {devicesConfig.devices.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDeviceType(d.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors
                  ${selectedDeviceType === d.id ? 'bg-blue-100 ring-2 ring-blue-500 font-semibold' : 'hover:bg-gray-100'}`}
              >
                <span className="text-gray-500 text-xs w-5 text-center">{d.inLine ? '▷' : '◉'}</span>
                <span>
                  {d.name}
                  {d.pairs != null && <span className="text-gray-400 text-xs ml-1">({d.pairs}P)</span>}
                  {d.inLine && <span className="text-orange-500 text-xs ml-1">[in Linie]</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
