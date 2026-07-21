import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useProjectStore } from '../../store/projectStore'
import RouteLayer from './RouteLayer'
import NodeLayer from './NodeLayer'
import DrawingTools from './DrawingTools'
import CrossingLayer from './CrossingLayer'

// Syncs map position back to store
function MapSync() {
  const setMapView = useProjectStore((s) => s.setMapView)
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter()
      setMapView({ lat: c.lat, lng: c.lng }, e.target.getZoom())
    },
    zoomend(e) {
      const c = e.target.getCenter()
      setMapView({ lat: c.lat, lng: c.lng }, e.target.getZoom())
    },
  })
  return null
}

export default function MapView({ activeTool, selectedCableType, selectedDeviceType, onRouteComplete, onNodePlace, onEditRoute, onEditNode, onCrossingPending, onEditCrossing }) {
  const mapCenter = useProjectStore((s) => s.mapCenter)
  const mapZoom = useProjectStore((s) => s.mapZoom)

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={mapZoom}
      maxZoom={22}
      className="w-full h-full"
      preferCanvas={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={22}
        maxNativeZoom={19}
      />
      <MapSync />
      <RouteLayer activeTool={activeTool} onEditRoute={onEditRoute} />
      <NodeLayer activeTool={activeTool} onEditNode={onEditNode} />
      <CrossingLayer activeTool={activeTool} onCrossingPending={onCrossingPending} onEditCrossing={onEditCrossing} />
      <DrawingTools
        activeTool={activeTool}
        selectedCableType={selectedCableType}
        selectedDeviceType={selectedDeviceType}
        onRouteComplete={onRouteComplete}
        onNodePlace={onNodePlace}
      />
    </MapContainer>
  )
}
