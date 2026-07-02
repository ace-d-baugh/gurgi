import type { RideConfig, Group, Guest } from '../types'

// World layout (units ~ meters):
// - The ride track runs along the X axis at z = TRACK_Z (far from camera).
// - The vehicle rests centered at x = 0 while loading.
// - Load-zone circles sit between the track and the queue.
// - The standby queue snakes toward the camera (+z), two guests wide.

export const ROW_SPACING = 1.0
export const SECTION_GAP = 0.55
export const SEAT_SPACING = 0.72
export const TRACK_Z = -6
export const CIRCLE_Z0 = -3.5
export const CIRCLE_SPACING = 0.66
export const QUEUE_PAIR_SPACING = 0.85
export const QUEUE_SEG_PAIRS = 12

export function totalRows(c: RideConfig) {
  return c.sections * c.rowsPerSection
}

export function trainLength(c: RideConfig) {
  return totalRows(c) * ROW_SPACING + (c.sections - 1) * SECTION_GAP
}

/** World x of a vehicle row (vehicle at rest). */
export function rowX(c: RideConfig, row: number) {
  const section = Math.floor(row / c.rowsPerSection)
  return row * ROW_SPACING + section * SECTION_GAP - trainLength(c) / 2 + ROW_SPACING / 2
}

/** Seat position (vehicle-local; equals world position while the vehicle is loading). */
export function seatPos(c: RideConfig, row: number, col: number) {
  return {
    x: rowX(c, row),
    z: TRACK_Z + (col - (c.guestsPerRow - 1) / 2) * SEAT_SPACING,
  }
}

/** Load-zone standing circle for a seat. */
export function circlePos(c: RideConfig, row: number, col: number) {
  return { x: rowX(c, row), z: CIRCLE_Z0 + col * CIRCLE_SPACING }
}

/** X where the standby queue lives (left of the vehicle). */
export function queueBaseX(c: RideConfig) {
  return -trainLength(c) / 2 - 4
}

function queueSlot(c: RideConfig, pair: number, side: number) {
  const seg = Math.floor(pair / QUEUE_SEG_PAIRS)
  const within = pair % QUEUE_SEG_PAIRS
  return {
    x: queueBaseX(c) - seg * 2.3 + (side === 0 ? 0.45 : -0.45),
    z: 1.4 + within * QUEUE_PAIR_SPACING,
  }
}

export function singleRiderSlot(c: RideConfig, index: number) {
  return { x: queueBaseX(c) + 1.9, z: 1.4 + index * 0.8 }
}

export interface GuestTarget {
  x: number
  z: number
}

/** Where the camera should look and from how far, framing queue + vehicle. */
export function sceneFocus(c: RideConfig, aspect: number) {
  const len = trainLength(c)
  const qx = queueBaseX(c)
  const xMin = qx - 3.5
  const xMax = len / 2 + 2
  const zMin = TRACK_Z - 2
  const zMax = 12.5
  const cx = (xMin + xMax) / 2
  const cz = (zMin + zMax) / 2
  const width = xMax - xMin
  const depth = zMax - zMin
  // Fit the scene bounds into the camera frustum (vertical FOV 48deg).
  const tanV = Math.tan((48 * Math.PI) / 360)
  const distW = (width / 2 / (tanV * Math.max(0.3, aspect))) * 1.08
  const distD = (depth / 2 / tanV) * 0.82
  const dist = Math.min(110, Math.max(14, Math.max(distW, distD)))
  return { cx, cz, dist }
}

/**
 * Computes the world position every queued guest should stand at.
 * The queue fills two-by-two; a group with an odd count leaves an
 * empty space so the next group starts on a fresh pair (PRD queue mode).
 */
export function computeQueueTargets(
  c: RideConfig,
  groups: Group[],
  singles: number[],
  guests: Record<number, Guest>,
): Map<number, GuestTarget> {
  const map = new Map<number, GuestTarget>()
  let pair = 0
  let side = 0
  for (const group of groups) {
    for (const id of group.guestIds) {
      const g = guests[id]
      if (!g || g.state !== 'queue') continue
      map.set(id, queueSlot(c, pair, side))
      if (side === 0) side = 1
      else {
        side = 0
        pair++
      }
    }
    if (side === 1) {
      side = 0
      pair++
    }
  }
  singles.forEach((id, i) => {
    const g = guests[id]
    if (!g || g.state !== 'queue') return
    map.set(id, singleRiderSlot(c, i))
  })
  return map
}
