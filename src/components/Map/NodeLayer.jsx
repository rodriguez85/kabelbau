import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useProjectStore } from '../../store/projectStore'
import devicesConfig from '../../config/devices.json'

const SYMBOL_URLS = import.meta.glob('../../symbols/*.j2', { eager: true })

function getSymbolUrl(filename) {
  if (!filename) return null
  const key = `../../symbols/${filename}`
  return SYMBOL_URLS[key]?.default ?? null
}

function makeDeviceIcon(deviceType) {
  const device = devicesConfig.devices.find((d) => d.id === deviceType)
  const url = device ? getSymbolUrl(device.symbol) : getSymbolUrl('Verteiler.j2')
  if (url) {
    return L.icon({
      iconUrl: url,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
    })
  }
  return L.divIcon({
    html: `<div style="background:white;border:2px solid black;border-radius:4px;padding:2px 4px;font-size:10px;font-weight:bold">${deviceType}</div>`,
    iconAnchor: [22, 22],
    className: '',
  })
}

function makeJunctionIcon() {
  const url = getSymbolUrl('Verteiler.j2')
  if (url) {
    return L.icon({ iconUrl: url, iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20] })
  }
  return L.divIcon({
    html: `<div style="background:white;border:2px solid black;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px">⊕</div>`,
    iconAnchor: [12, 12],
    className: '',
  })
}

export default function NodeLayer({ activeTool, onEditNode }) {
  const map = useMap()
  const nodes = useProjectStore((s) => s.nodes)
  const routes = useProjectStore((s) => s.routes)
  const deleteNode = useProjectStore((s) => s.deleteNode)
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }
    const group = layerGroupRef.current
    group.clearLayers()

    for (const node of nodes) {
      const icon = node.type === 'junction' ? makeJunctionIcon() : makeDeviceIcon(node.deviceType)
      const marker = L.marker([node.position.lat, node.position.lng], { icon })

      const device = devicesConfig.devices.find((d) => d.id === node.deviceType)
      const connectedPairs = node.connectedRouteIds.reduce((sum, rid) => {
        const r = routes.find((ro) => ro.id === rid)
        return sum + (r ? (getCablePairs(r.cableType)) : 0)
      }, 0)
      const capacity = device?.pairs ?? '∞'
      const overload = device?.pairs != null && connectedPairs > device.pairs

      marker.bindPopup(`
        <div class="text-sm min-w-[160px]">
          <strong>${node.name}</strong><br/>
          ${device ? `Typ: ${device.name}<br/>Kapazität: ${capacity} Aderpaare` : 'Knotenpunkt'}
          ${overload ? '<br/><span style="color:red;font-weight:bold">⚠ Kapazität überschritten!</span>' : ''}
        </div>
      `)

      marker.on('click', (e) => {
        if (activeTool === 'cable') {
          map.fire('click', { latlng: marker.getLatLng(), originalEvent: e.originalEvent })
          return
        }
        if (activeTool === 'delete') { deleteNode(node.id); return }
        marker.openPopup()
      })
      marker.on('dblclick', (e) => {
        if (activeTool === 'cable') {
          // Both taps of a dblclick re-fire as map clicks; the second is caught as dblclick by DrawingTools
          map.fire('click', { latlng: marker.getLatLng(), originalEvent: e.originalEvent })
          return
        }
        L.DomEvent.stopPropagation(e)
        onEditNode?.(node)
      })

      group.addLayer(marker)
    }

    return () => group.clearLayers()
  }, [map, nodes, routes, activeTool, onEditNode])

  return null
}

function getCablePairs(cableId) {
  // inline import to avoid circular dep
  const cables = { feldkabel: 1, feldfernkabel: 2, anschlusskabel: 10 }
  return cables[cableId] ?? 1
}
