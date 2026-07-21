import L from 'leaflet'

const SNAP_PX = 20

function nearestOnSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return { pt: L.point(a.x, a.y), dist: p.distanceTo(a) }
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq))
  const pt = L.point(a.x + t * dx, a.y + t * dy)
  return { pt, dist: p.distanceTo(pt) }
}

export function findNearestOnRoutes(routes, clickLatLng, map, snapPx = SNAP_PX) {
  const clickPx = map.latLngToLayerPoint(clickLatLng)
  let bestDist = Infinity
  let bestRoute = null
  let bestPt = null

  for (const route of routes) {
    if (route.points.length < 2) continue
    const pts = route.points.map((p) => map.latLngToLayerPoint(L.latLng(p.lat, p.lng)))
    for (let i = 0; i < pts.length - 1; i++) {
      const { pt, dist } = nearestOnSegment(clickPx, pts[i], pts[i + 1])
      if (dist < bestDist) { bestDist = dist; bestRoute = route; bestPt = pt }
    }
  }

  if (bestRoute && bestDist <= snapPx) {
    const ll = map.layerPointToLatLng(bestPt)
    return { route: bestRoute, position: { lat: ll.lat, lng: ll.lng } }
  }
  return null
}
