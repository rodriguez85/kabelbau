import cablesConfig from '../config/cables.json'
import devicesConfig from '../config/devices.json'
import crossingsConfig from '../config/crossings.json'

export function getMaterialSummary(routes, nodes, crossings = []) {
  const cableMap = {}
  for (const route of routes) {
    const cable = cablesConfig.cables.find((c) => c.id === route.cableType)
    if (!cable) continue
    if (!cableMap[cable.id]) {
      cableMap[cable.id] = { ...cable, count: 0, totalDistance: 0 }
    }
    cableMap[cable.id].count += route.cablesNeeded ?? 0
    cableMap[cable.id].totalDistance += route.distanceM ?? 0
  }

  const deviceMap = {}
  for (const node of nodes) {
    if (node.type !== 'device' && node.type !== 'inline') continue
    const device = devicesConfig.devices.find((d) => d.id === node.deviceType)
    if (!device) continue
    if (!deviceMap[device.id]) {
      deviceMap[device.id] = { ...device, count: 0 }
    }
    deviceMap[device.id].count += 1
  }

  const crossingItemMap = {}
  for (const crossing of crossings) {
    const materials = crossingsConfig.materials[crossing.cableType] ?? []
    const mult = crossing.sided === 'beidseitig' ? 2 : 1
    for (const m of materials) {
      const count = crossing.customCounts?.[m.name] ?? m.count * mult
      if (!crossingItemMap[m.name]) crossingItemMap[m.name] = { name: m.name, count: 0 }
      crossingItemMap[m.name].count += count
    }
  }

  return {
    cables: Object.values(cableMap),
    devices: Object.values(deviceMap),
    crossingItems: Object.values(crossingItemMap),
  }
}
