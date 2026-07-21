import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { nanoid } from 'nanoid'
import { useProjectStore } from '../../store/projectStore'
import { calculateDistance, calculateCablesNeeded } from '../../utils/cableCalc'
import { findNearestOnRoutes } from '../../utils/mapUtils'
import cablesConfig from '../../config/cables.json'
import devicesConfig from '../../config/devices.json'

const SNAP_PX = 30
const DBLCLICK_MS = 300

export default function DrawingTools({ activeTool, selectedCableType, selectedDeviceType, onRouteComplete, onNodePlace }) {
  const map = useMap()
  const addRouteWithNodes = useProjectStore((s) => s.addRouteWithNodes)
  const addNode = useProjectStore((s) => s.addNode)
  const nodes = useProjectStore((s) => s.nodes)
  const routes = useProjectStore((s) => s.routes)

  const pointsRef = useRef([])
  const snapStartNodeIdRef = useRef(null)
  const lastClickTimeRef = useRef(0)
  const justCompletedRef = useRef(false)
  const previewLayerRef = useRef(null)
  const snapIndicatorRef = useRef(null)

  useEffect(() => {
    if (!previewLayerRef.current) previewLayerRef.current = L.layerGroup().addTo(map)
    if (!snapIndicatorRef.current) snapIndicatorRef.current = L.layerGroup().addTo(map)
  }, [map])

  useEffect(() => {
    if (activeTool === 'cable') {
      map.doubleClickZoom.disable()
    } else {
      map.doubleClickZoom.enable()
      resetDrawing()
      snapIndicatorRef.current?.clearLayers()
    }
    return () => { map.doubleClickZoom.enable() }
  }, [activeTool, map])

  function resetDrawing() {
    pointsRef.current = []
    snapStartNodeIdRef.current = null
    lastClickTimeRef.current = 0
    justCompletedRef.current = true
    previewLayerRef.current?.clearLayers()
  }

  function updatePreview(cursorPos) {
    const layer = previewLayerRef.current
    layer.clearLayers()
    const pts = pointsRef.current
    const cable = cablesConfig.cables.find((c) => c.id === selectedCableType)
    const color = cable?.color ?? '#555'

    if (pts.length >= 2) {
      L.polyline(pts.map((p) => [p.lat, p.lng]), { color, weight: 2, opacity: 0.8 }).addTo(layer)
    }
    if (pts.length >= 1 && cursorPos) {
      const last = pts[pts.length - 1]
      L.polyline([[last.lat, last.lng], [cursorPos.lat, cursorPos.lng]], {
        color, weight: 2, dashArray: '5 6', opacity: 0.5,
      }).addTo(layer)
    }
  }

  function completeRoute(pts, startNodeId, endNodeId) {
    if (pts.length < 2) { resetDrawing(); return }
    const distM = calculateDistance(pts)
    const route = {
      id: nanoid(),
      name: `Strecke ${nanoid(4)}`,
      points: pts,
      cableType: selectedCableType,
      distanceM: distM,
      cablesNeeded: calculateCablesNeeded(distM, selectedCableType),
      color: null,
      startNodeId: startNodeId ?? null,
      endNodeId: endNodeId ?? null,
    }
    addRouteWithNodes(route)
    onRouteComplete?.(route)
    resetDrawing()
  }

  const selectedDevice = devicesConfig.devices.find((d) => d.id === selectedDeviceType)
  const isInLine = selectedDevice?.inLine === true

  useMapEvents({
    mousemove(e) {
      if (activeTool === 'cable') {
        const pos = { lat: e.latlng.lat, lng: e.latlng.lng }
        const snapNode = findNearbyNode(pos, nodes, map, SNAP_PX)
        snapIndicatorRef.current.clearLayers()
        if (snapNode) {
          L.circleMarker([snapNode.position.lat, snapNode.position.lng], {
            radius: 20, color: '#f59e0b', weight: 2.5, fill: false, opacity: 0.9,
          }).addTo(snapIndicatorRef.current)
        }
        updatePreview(snapNode ? snapNode.position : pos)
      } else if (activeTool === 'device' && isInLine) {
        snapIndicatorRef.current.clearLayers()
        const result = findNearestOnRoutes(routes, e.latlng, map)
        if (result) {
          L.circleMarker([result.position.lat, result.position.lng], {
            radius: 8, color: '#f59e0b', weight: 2, fill: true, fillOpacity: 0.4, opacity: 0.9,
          }).addTo(snapIndicatorRef.current)
        }
      }
    },

    click(e) {
      if (activeTool === 'cable') {
        if (justCompletedRef.current) { justCompletedRef.current = false; return }

        const now = Date.now()
        const isDblClick = now - lastClickTimeRef.current < DBLCLICK_MS
        lastClickTimeRef.current = now

        const pos = { lat: e.latlng.lat, lng: e.latlng.lng }
        const snapNode = findNearbyNode(pos, nodes, map, SNAP_PX)
        const actualPos = snapNode ? snapNode.position : pos
        const pts = pointsRef.current

        if (isDblClick) {
          if (pts.length >= 2) completeRoute(pts, snapStartNodeIdRef.current, snapNode?.id ?? null)
          else resetDrawing()
          return
        }

        if (pts.length === 0) {
          snapStartNodeIdRef.current = snapNode?.id ?? null
          pointsRef.current = [actualPos]
        } else if (snapNode) {
          completeRoute([...pts, actualPos], snapStartNodeIdRef.current, snapNode.id)
        } else {
          pointsRef.current = [...pts, actualPos]
          updatePreview(null)
        }

      } else if (activeTool === 'device' && selectedDeviceType) {
        if (isInLine) {
          const result = findNearestOnRoutes(routes, e.latlng, map)
          if (!result) return
          addNode({
            id: nanoid(),
            type: 'inline',
            deviceType: selectedDeviceType,
            name: selectedDeviceType,
            position: result.position,
            connectedRouteIds: [result.route.id],
          })
        } else {
          const pos = { lat: e.latlng.lat, lng: e.latlng.lng }
          addNode({
            id: nanoid(),
            type: 'device',
            deviceType: selectedDeviceType,
            name: selectedDeviceType,
            position: pos,
            connectedRouteIds: [],
          })
        }
        onNodePlace?.()
      }
    },
  })

  useEffect(() => {
    const container = map.getContainer()
    if (activeTool === 'cable' || activeTool === 'device' || activeTool === 'crossing') {
      container.style.cursor = 'crosshair'
    } else if (activeTool === 'delete') {
      container.style.cursor = 'not-allowed'
    } else {
      container.style.cursor = ''
    }
    return () => { container.style.cursor = '' }
  }, [activeTool, map])

  return null
}

function findNearbyNode(pos, nodes, map, thresholdPx) {
  const posPoint = map.latLngToContainerPoint([pos.lat, pos.lng])
  for (const n of nodes) {
    const nPoint = map.latLngToContainerPoint([n.position.lat, n.position.lng])
    if (posPoint.distanceTo(nPoint) <= thresholdPx) return n
  }
  return null
}
