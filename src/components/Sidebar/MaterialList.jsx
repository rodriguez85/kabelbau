import { useMemo } from 'react'
import { useProjectStore } from '../../store/projectStore'
import { getMaterialSummary } from '../../utils/materialSummary'
import { exportMaterialCSV } from '../../utils/projectIO'

export default function MaterialList() {
  const routes = useProjectStore((s) => s.routes)
  const nodes = useProjectStore((s) => s.nodes)
  const crossings = useProjectStore((s) => s.crossings)

  const summary = useMemo(() => getMaterialSummary(routes, nodes, crossings), [routes, nodes, crossings])

  const empty = summary.cables.length === 0 && summary.devices.length === 0 && summary.crossingItems.length === 0

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase">Materialliste</p>
        <button
          onClick={() => exportMaterialCSV(summary)}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          title="Als CSV exportieren"
        >
          CSV ↓
        </button>
      </div>

      {summary.cables.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Kabel</p>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-1">Typ</th>
                <th className="pb-1 text-right">Anz.</th>
                <th className="pb-1 text-right">Länge</th>
              </tr>
            </thead>
            <tbody>
              {summary.cables.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="py-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </td>
                  <td className="py-1 text-right font-semibold">{c.count}×</td>
                  <td className="py-1 text-right text-gray-500">{Math.round(c.totalDistance)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.devices.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Geräte</p>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-1">Gerät</th>
                <th className="pb-1 text-right">Anz.</th>
              </tr>
            </thead>
            <tbody>
              {summary.devices.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="py-1">{d.name}</td>
                  <td className="py-1 text-right font-semibold">{d.count}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.crossingItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Wegeübergänge</p>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-1">Material</th>
                <th className="pb-1 text-right">Anz.</th>
              </tr>
            </thead>
            <tbody>
              {summary.crossingItems.map((item) => (
                <tr key={item.name} className="border-t border-gray-100">
                  <td className="py-1">{item.name}</td>
                  <td className="py-1 text-right font-semibold">{item.count}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {empty && (
        <p className="text-xs text-gray-400">Zeichne Strecken und platziere Geräte,<br/>um die Materialliste zu sehen.</p>
      )}
    </div>
  )
}
