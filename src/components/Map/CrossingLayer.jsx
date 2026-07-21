import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useProjectStore } from '../../store/projectStore'
import { findNearestOnRoutes } from '../../utils/mapUtils'

const SYMBOL_URLS = import.meta.glob('../../symbols/*.j2', { eager: true })
const crossingSymbolUrl = SYMBOL_URLS['../../symbols/Wegeuebergang.j2']?.default ?? null

function makeCrossingIcon() {
  if (crossingSymbolUrl) {
    return L.icon({
      iconUrl: crossingSymbolUrl,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -13],
    })
  }
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="white" stroke="black" stroke-width="2"/>
      <text font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle" x="14" y="19" fill="black">H</text>
    </svg>`,
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    className: '',
  })
}

export default function CrossingLayer({ activeTool, onCrossingPending, onEditCrossing }) {
  const map = useMap()
  const routes = useProjectStore((s) => s.routes)
  const crossings = useProjectStore((s) => s.crossings)
  const deleteCrossing = useProjectStore((s) => s.deleteCrossing)
  const layerGroupRef = useRef(null)
  const snapIndicatorRef = useRef(null)

  useEffect(() => {
    if (!layerGroupRef.current) layerGroupRef.current = L.layerGroup().addTo(map)
    if (!snapIndicatorRef.current) snapIndicatorRef.current = L.layerGroup().addTo(map)
  }, [map])

  useEffect(() => {
    const group = layerGroupRef.current
    if (!group) return
    group.clearLayers()

    for (const crossing of crossings) {
      const marker = L.marker([crossing.position.lat, crossing.position.lng], { icon: makeCrossingIcon() })

      marker.bindPopup(`
        <div class="text-sm min-w-[160px]">
          <strong>${crossing.name}</strong><br/>
          Kabelart: ${crossing.cableType}<br/>
          Hochbau: ${crossing.sided === 'beidseitig' ? 'Beidseitig' : 'Einseitig'}<br/>
          <small style="color:#888">Doppelklick zum Bearbeiten</small>
        </div>
      `)

      marker.on('click', (e) => {
        if (activeTool === 'cable') {
          map.fire('click', { latlng: marker.getLatLng(), originalEvent: e.originalEvent })
          return
        }
        if (activeTool === 'delete') { deleteCrossing(crossing.id); return }
        marker.openPopup()
      })
      marker.on('dblclick', (e) => {
        if (activeTool === 'cable') {
          map.fire('click', { latlng: marker.getLatLng(), originalEvent: e.originalEvent })
          return
        }
        L.DomEvent.stopPropagation(e)
        onEditCrossing?.(crossing)
      })

      group.addLayer(marker)
    }

    return () => group?.clearLayers()
  }, [map, crossings, activeTool, deleteCrossing, onEditCrossing])

  useEffect(() => {
    if (activeTool !== 'crossing') snapIndicatorRef.current?.clearLayers()
  }, [activeTool])

  useMapEvents({
    mousemove(e) {
      if (activeTool !== 'crossing') return
      snapIndicatorRef.current?.clearLayers()
      const result = findNearestOnRoutes(routes, e.latlng, map)
      if (result) {
        L.circleMarker([result.position.lat, result.position.lng], {
          radius: 8, color: '#f59e0b', weight: 2, fill: true, fillOpacity: 0.4, opacity: 0.9,
        }).addTo(snapIndicatorRef.current)
      }
    },
    click(e) {
      if (activeTool !== 'crossing') return
      const result = findNearestOnRoutes(routes, e.latlng, map)
      if (result) {
        onCrossingPending?.({ routeId: result.route.id, position: result.position, cableType: result.route.cableType })
      }
    },
  })

  return null
}
