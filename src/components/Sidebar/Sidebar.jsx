import { useState } from 'react'
import ToolPanel from './ToolPanel'
import MaterialList from './MaterialList'

const TABS = [
  { id: 'tools', label: 'Werkzeuge' },
  { id: 'material', label: 'Material' },
]

export default function Sidebar({ activeTool, setActiveTool, selectedCableType, setSelectedCableType, selectedDeviceType, setSelectedDeviceType }) {
  const [activeTab, setActiveTab] = useState('tools')

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${activeTab === t.id ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1">
        {activeTab === 'tools' && (
          <ToolPanel
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            selectedCableType={selectedCableType}
            setSelectedCableType={setSelectedCableType}
            selectedDeviceType={selectedDeviceType}
            setSelectedDeviceType={setSelectedDeviceType}
          />
        )}
        {activeTab === 'material' && <MaterialList />}
      </div>
    </div>
  )
}
