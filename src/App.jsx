import { useState } from 'react'
import { nanoid } from 'nanoid'
import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import Toolbar from './components/Toolbar'
import RouteModal from './components/Modals/RouteModal'
import NodeModal from './components/Modals/NodeModal'
import CrossingModal from './components/Modals/CrossingModal'
import { useProjectStore } from './store/projectStore'

export default function App() {
  const addCrossing = useProjectStore((s) => s.addCrossing)
  const updateCrossing = useProjectStore((s) => s.updateCrossing)

  const [activeTool, setActiveTool] = useState('select')
  const [selectedCableType, setSelectedCableType] = useState('feldkabel')
  const [selectedDeviceType, setSelectedDeviceType] = useState('feldtelefon')
  const [editRoute, setEditRoute] = useState(null)
  const [editNode, setEditNode] = useState(null)
  const [pendingCrossing, setPendingCrossing] = useState(null)

  function handleCrossingConfirm({ name, sided, customCounts }) {
    if (pendingCrossing.id) {
      updateCrossing(pendingCrossing.id, { name, sided, customCounts })
    } else {
      addCrossing({ ...pendingCrossing, id: nanoid(), name, sided, customCounts })
    }
    setPendingCrossing(null)
  }

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
            onCrossingPending={setPendingCrossing}
            onEditCrossing={setPendingCrossing}
          />
        </div>
      </div>

      {editRoute && (
        <RouteModal route={editRoute} onClose={() => setEditRoute(null)} />
      )}
      {editNode && (
        <NodeModal node={editNode} onClose={() => setEditNode(null)} />
      )}
      {pendingCrossing && (
        <CrossingModal
          pending={pendingCrossing}
          onConfirm={handleCrossingConfirm}
          onClose={() => setPendingCrossing(null)}
        />
      )}
    </div>
  )
}
