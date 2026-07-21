import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-polylinedecorator'
import { useProjectStore } from '../../store/projectStore'
import { calculateDistance, calculateCablesNeeded, getRouteColor, getCableById } from '../../utils/cableCalc'

// Leaflet PolylineDecorator patterns per cable type
function buildDecorator(polyline, cableType, color) {
  if (typeof L.PolylineDecorator !== 'function') return null

  const tickOffset = 30
  let patterns = []

  if (cableType === 'feldkabel') {
    patterns = [{
      offset: tickOffset, repeat: tickOffset,
      symbol: L.Symbol.dash({ pixelSize: 12, pathOptions: { color, weight: 2, rotate: 90 } }),
    }]
  } else if (cableType === 'feldfernkabel') {
    patterns = [
      { offset: tickOffset, repeat: tickOffset, symbol: L.Symbol.dash({ pixelSize: 12, pathOptions: { color, weight: 2, rotate: 85 } }) },
      { offset: tickOffset + 5, repeat: tickOffset, symbol: L.Symbol.dash({ pixelSize: 12, pathOptions: { color, weight: 2, rotate: 85 } }) },
    ]
  } else if (cableType === 'anschlusskabel') {
    patterns = [{
      offset: tickOffset, repeat: tickOffset,
      symbol: L.Symbol.dash({ pixelSize: 8, pathOptions: { color, weight: 3, rotate: 90 } }),
    }]
  }
  return new L.PolylineDecorator(polyline, { patterns })
}

export default function RouteLayer({ activeTool, onEditRoute }) {
  const map = useMap()
  const routes = useProjectStore((s) => s.routes)
  const updateRoute = useProjectStore((s) => s.updateRoute)
  const deleteRoute = useProjectStore((s) => s.deleteRoute)
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }
    const group = layerGroupRef.current
    group.clearLayers()

    for (const route of routes) {
      if (route.points.length < 2) continue
      const color = getRouteColor(route)
      const latlngs = route.points.map((p) => [p.lat, p.lng])
      const polyline = L.polyline(latlngs, { color, weight: 3, opacity: 0.9 })

      const cable = getCableById(route.cableType)
      const distKm = ((route.distanceM ?? 0) / 1000).toFixed(2)
      polyline.bindPopup(`
        <div class="text-sm min-w-[180px]">
          <strong>${route.name}</strong><br/>
          <span style="color:#555">${cable?.name ?? route.cableType}</span><br/>
          Länge: ${Math.round(route.distanceM ?? 0)} m (${distKm} km)<br/>
          Kabellängen: <strong>${route.cablesNeeded ?? 0}×</strong> à ${cable?.lengthM ?? '?'} m<br/>
          Aderpaare: ${cable?.pairs ?? '?'}<br/>
          <small style="color:#888">Doppelklick zum Bearbeiten</small>
        </div>
      `)

      polyline.on('click', (e) => {
        if (activeTool === 'delete') { deleteRoute(route.id); return }
        e.target.openPopup()
      })
      polyline.on('dblclick', (e) => {
        L.DomEvent.stopPropagation(e)
        onEditRoute?.(route)
      })

      group.addLayer(polyline)

      try {
        const dec = buildDecorator(polyline, route.cableType, color)
        if (dec) group.addLayer(dec)
      } catch {}
    }

    return () => group.clearLayers()
  }, [map, routes, activeTool, onEditRoute])

  return null
}
