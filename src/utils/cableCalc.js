import * as turf from '@turf/turf'
import cablesConfig from '../config/cables.json'

export function getCableById(id) {
  return cablesConfig.cables.find((c) => c.id === id)
}

export function calculateDistance(points) {
  if (points.length < 2) return 0
  const coords = points.map((p) => [p.lng, p.lat])
  const line = turf.lineString(coords)
  return turf.length(line, { units: 'meters' })
}

export function calculateCablesNeeded(distanceM, cableId) {
  const cable = getCableById(cableId)
  if (!cable) return 0
  return Math.ceil(distanceM / cable.lengthM)
}

export function getRouteColor(route) {
  if (route.color) return route.color
  const cable = getCableById(route.cableType)
  return cable?.color ?? '#555'
}
