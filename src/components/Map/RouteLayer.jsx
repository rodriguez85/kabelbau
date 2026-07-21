import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useProjectStore } from '../../store/projectStore'
import { getRouteColor, getCableById } from '../../utils/cableCalc'

const TICK_INTERVAL = 80  // px between ticks
const TICK_HALF = 7       // half-length of tick in px

function getPosAtDist(segs, dist) {
  let cum = 0
  for (const seg of segs) {
    if (cum + seg.len >= dist) {
      const t = (dist - cum) / seg.len
      return {
        px: seg.px + t * seg.dx,
        py: seg.py + t * seg.dy,
        angle: Math.atan2(seg.dy, seg.dx),
      }
    }
    cum += seg.len
  }
  return null
}

function makeTick(map, pos, lineOffset, color) {
  const perp = pos.angle + Math.PI / 2
  const cx = pos.px + lineOffset * Math.cos(pos.angle)
  const cy = pos.py + lineOffset * Math.sin(pos.angle)
  const p1 = map.layerPointToLatLng([cx - TICK_HALF * Math.cos(perp), cy - TICK_HALF * Math.sin(perp)])
  const p2 = map.layerPointToLatLng([cx + TICK_HALF * Math.cos(perp), cy + TICK_HALF * Math.sin(perp)])
  return L.polyline([p1, p2], { color, weight: 2, opacity: 0.9, interactive: false })
}

function buildTickLayers(map, points, cableType, color) {
  if (points.length < 2) return []

  const px = points.map(p => map.latLngToLayerPoint(L.latLng(p.lat, p.lng)))
  const segs = []
  let totalLen = 0
  for (let i = 0; i < px.length - 1; i++) {
    const dx = px[i + 1].x - px[i].x
    const dy = px[i + 1].y - px[i].y
    const len = Math.sqrt(dx * dx + dy * dy)
    segs.push({ len, dx, dy, px: px[i].x, py: px[i].y })
    totalLen += len
  }
  if (totalLen < TICK_INTERVAL) return []

  const layers = []

  if (cableType === 'anschlusskabel') {
    const mid = getPosAtDist(segs, totalLen / 2)
    if (mid) {
      const ll = map.layerPointToLatLng([mid.px, mid.py])
      layers.push(L.marker(ll, {
        icon: L.divIcon({
          html: `<span style="font-size:11px;font-weight:bold;color:${color};background:white;padding:0 3px;border-radius:2px;white-space:nowrap;line-height:1.2">10'</span>`,
          className: '',
          iconAnchor: [14, 9],
        }),
        interactive: false,
        zIndexOffset: 50,
      }))
    }
    return layers
  }

  let dist = TICK_INTERVAL / 2
  while (dist < totalLen - TICK_INTERVAL / 4) {
    const pos = getPosAtDist(segs, dist)
    if (pos) {
      if (cableType === 'feldkabel') {
        layers.push(makeTick(map, pos, 0, color))
      } else if (cableType === 'feldfernkabel') {
        layers.push(makeTick(map, pos, -3.5, color))
        layers.push(makeTick(map, pos, +3.5, color))
      }
    }
    dist += TICK_INTERVAL
  }

  return layers
}

export default function RouteLayer({ activeTool, onEditRoute }) {
  const map = useMap()
  const routes = useProjectStore((s) => s.routes)
  const deleteRoute = useProjectStore((s) => s.deleteRoute)
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }
    const group = layerGroupRef.current

    function rebuild() {
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

        for (const tick of buildTickLayers(map, route.points, route.cableType, color)) {
          group.addLayer(tick)
        }
      }
    }

    rebuild()
    map.on('zoomend', rebuild)

    return () => {
      map.off('zoomend', rebuild)
      group.clearLayers()
    }
  }, [map, routes, activeTool, onEditRoute, deleteRoute])

  return null
}
