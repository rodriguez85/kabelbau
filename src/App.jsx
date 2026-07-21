import { useState } from 'react'
import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import Toolbar from './components/Toolbar'
import RouteModal from './components/Modals/RouteModal'
import NodeModal from './components/Modals/NodeModal'

export default function App() {
  const [activeTool, setActiveTool] = useState('select')
  const [selectedCableType, setSelectedCableType] = useState('feldkabel')
  const [selectedDeviceType, setSelectedDeviceType] = useState('feldtelefon')
  const [editRoute, setEditRoute] = useState(null)
  const [editNode, setEditNode] = useState(null)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedCableType={selectedCableType}
          setSelectedCableType={setSelectedCableType}
          selectedDeviceType={selectedDeviceType}
          setSelectedDeviceType={setSelectedDeviceType}
        />
        <div className="flex-1 relative">
          <MapView
            activeTool={activeTool}
            selectedCableType={selectedCableType}
            selectedDeviceType={selectedDeviceType}
            onEditRoute={setEditRoute}
            onEditNode={setEditNode}
          />
        </div>
      </div>

      {editRoute && (
        <RouteModal route={editRoute} onClose={() => setEditRoute(null)} />
      )}
      {editNode && (
        <NodeModal node={editNode} onClose={() => setEditNode(null)} />
      )}
    </div>
  )
}
