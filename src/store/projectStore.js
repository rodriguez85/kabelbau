import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { calculateDistance, calculateCablesNeeded } from '../utils/cableCalc'
import cablesConfig from '../config/cables.json'

const STORAGE_KEY = 'kabelbau_project'

const defaultState = {
  name: 'Neues Projekt',
  routes: [],
  nodes: [],
  mapCenter: { lat: 51.1657, lng: 10.4515 },
  mapZoom: 7,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultState, ...JSON.parse(raw) }
  } catch {}
  return defaultState
}

export const useProjectStore = create(
  subscribeWithSelector((set, get) => ({
    ...loadFromStorage(),

    setProjectName: (name) => set({ name }),

    setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),

    // Routes
    addRoute: (route) =>
      set((s) => ({ routes: [...s.routes, route] })),

    // Add route and update connected node references atomically
    addRouteWithNodes: (route) =>
      set((s) => ({
        routes: [...s.routes, route],
        nodes: s.nodes.map((n) => {
          if (n.id === route.startNodeId || n.id === route.endNodeId) {
            return { ...n, connectedRouteIds: [...n.connectedRouteIds, route.id] }
          }
          return n
        }),
      })),

    updateRoute: (id, patch) =>
      set((s) => ({
        routes: s.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),

    deleteRoute: (id) =>
      set((s) => ({
        routes: s.routes.filter((r) => r.id !== id),
        nodes: s.nodes.map((n) => ({
          ...n,
          connectedRouteIds: n.connectedRouteIds.filter((rid) => rid !== id),
        })),
      })),

    // Nodes
    addNode: (node) =>
      set((s) => ({ nodes: [...s.nodes, node] })),

    updateNode: (id, patch) =>
      set((s) => ({
        nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      })),

    deleteNode: (id) =>
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== id),
        routes: s.routes.map((r) => ({
          ...r,
          startNodeId: r.startNodeId === id ? null : r.startNodeId,
          endNodeId: r.endNodeId === id ? null : r.endNodeId,
        })),
      })),

    // Project IO
    loadProject: (data) => set({ ...defaultState, ...data }),

    resetProject: () => set({ ...defaultState, name: 'Neues Projekt' }),
  }))
)

// Autosave on every state change
useProjectStore.subscribe(
  (state) => state,
  (state) => {
    try {
      const { name, routes, nodes, mapCenter, mapZoom } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, routes, nodes, mapCenter, mapZoom }))
    } catch {}
  }
)
