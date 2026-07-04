import type { RideConfig, Group, Guest } from '../types'

// World layout (units ~ meters):
// - Linear rides (coaster, continuous, theater) run along the X axis; vehicles
//   travel LEFT -> RIGHT. The track sits at z = TRACK_Z (far from camera).
// - Round rides (carousel, spinner) spin around a center behind the load zone.
// - Load-zone circles sit between the ride and the queue.
// - The standby queue is a serpentine (switchbacks) toward the camera (+z),
//   two guests wide, with a "grouper" host at the front.

export const TRACK_Z = -6
export const CIRCLE_Z0 = -3.4
export const CIRCLE_SPACING = 0.66
export const STAGE_OFFSET = 1.15 // second-rank (staged) circles sit behind the primary ones
export const ROW_PITCH = 1.05 // x distance between row circle blocks
export const SEAT_SPACING = 0.72
export const COASTER_SECTION_GAP = 0.55
export const ROUND_CENTER_Z = -9.2

// Serpentine queue
export const Q_LANE_PAIRS = 9 // pairs per switchback lane
export const Q_PAIR_SPACING = 0.85
export const Q_LANE_GAP = 1.25

// Continuous mover motion
export const CONT_SPEED = 1.0 // units/sec, left -> right
export const CONT_GAP = 3.0

export function totalRows(c: RideConfig) {
  return c.rowSeats.length
}

export function maxRowSeats(c: RideConfig) {
  return Math.max(1, ...c.rowSeats)
}

/** Width of the load-zone strip of row circle blocks. */
export function loadZoneWidth(c: RideConfig) {
  if (c.rideType === 'theater') return maxRowSeats(c) * CIRCLE_SPACING
  if (c.rideType === 'continuous') return (c.loadSpots - 1) * spotPitch(c)
  return (totalRows(c) - 1) * ROW_PITCH
}

function spotPitch(c: RideConfig) {
  return Math.max(3.4, contLength(c) + 1.2)
}

/** X center of a row's circle block (or a loading spot for continuous). */
export function rowLoadX(c: RideConfig, row: number) {
  if (c.rideType === 'continuous') return -loadZoneWidth(c) / 2 + row * spotPitch(c)
  if (c.rideType === 'theater') return 0
  return -loadZoneWidth(c) / 2 + row * ROW_PITCH
}

/** World position of a load-zone standing circle. */
export function circleWorld(c: RideConfig, row: number, col: number, staged = false) {
  if (c.rideType === 'theater') {
    // Theater rows stack in z (row 1 is the deepest); staged circles form a
    // mirror block behind the primary one.
    const seats = c.rowSeats[row] ?? 1
    const z = CIRCLE_Z0 + row * 0.8 + (staged ? totalRows(c) * 0.8 + 0.7 : 0)
    return { x: (col - (seats - 1) / 2) * CIRCLE_SPACING, z }
  }
  const dz = staged ? STAGE_OFFSET : 0
  return { x: rowLoadX(c, row), z: CIRCLE_Z0 + col * CIRCLE_SPACING + dz }
}

export interface SeatPose {
  x: number
  z: number
  ry: number
}

// --- Coaster train -------------------------------------------------------

export function coasterTrainLength(c: RideConfig) {
  return totalRows(c) * 1.0 + (c.sections - 1) * COASTER_SECTION_GAP
}

export function coasterRowX(c: RideConfig, row: number) {
  const section = Math.floor(row / Math.max(1, c.rowsPerSection))
  return row * 1.0 + section * COASTER_SECTION_GAP - coasterTrainLength(c) / 2 + 0.5
}

// --- Continuous mover vehicles -------------------------------------------

export function contLength(c: RideConfig) {
  return maxRowSeats(c) * SEAT_SPACING + 0.6
}

export function contWidth(c: RideConfig) {
  return totalRows(c) * 0.8 + 0.4
}

/** Seat local position within a continuous vehicle (vehicle centered at 0, on track). */
export function contSeatLocal(c: RideConfig, row: number, col: number): SeatPose {
  const seats = c.rowSeats[row] ?? 1
  return {
    x: (col - (seats - 1) / 2) * SEAT_SPACING,
    z: TRACK_Z + (contWidth(c) / 2 - 0.5) - row * 0.8,
    ry: 0, // face the loading area (+z)
  }
}

// --- Round rides (carousel / spinner) -------------------------------------

export function carouselRadii(c: RideConfig) {
  const inner = 1.3
  const outer = inner + maxRowSeats(c) * 0.72
  const minR = (totalRows(c) * 1.5) / (2 * Math.PI)
  const scale = Math.max(1, minR / Math.max(2, outer - 0.7))
  return { inner: inner * scale, outer: outer * scale + 0.7 }
}

export function rowAngle(c: RideConfig, row: number) {
  if (c.rideType === 'spinner') {
    const spoke = Math.floor(row / c.rowsPerSpoke)
    return (spoke / c.spokes) * Math.PI * 2
  }
  return (row / Math.max(1, totalRows(c))) * Math.PI * 2
}

export function spinnerRowRadius(c: RideConfig, row: number) {
  const within = row % c.rowsPerSpoke
  const { outer } = carouselRadii(c)
  return Math.max(2.4, outer) + within * 1.5
}

/**
 * Seat pose local to the (rotating) ride platform, relative to the ride center.
 * The platform group is positioned at (0, 0, ROUND_CENTER_Z) and rotates around Y.
 */
export function roundSeatLocal(c: RideConfig, row: number, col: number): SeatPose {
  const a = rowAngle(c, row)
  if (c.rideType === 'spinner') {
    const r = spinnerRowRadius(c, row)
    const seats = c.rowSeats[row] ?? 1
    // seats spread tangentially; car faces counter-clockwise travel
    const t = (col - (seats - 1) / 2) * SEAT_SPACING
    const x = Math.cos(a) * r - Math.sin(a) * t
    const z = Math.sin(a) * r + Math.cos(a) * t
    return { x, z, ry: Math.atan2(-Math.sin(a), Math.cos(a)) + Math.PI }
  }
  // carousel: bench runs radially, innermost seat first
  const { inner } = carouselRadii(c)
  const r = inner + col * 0.72
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, ry: Math.atan2(-Math.sin(a), Math.cos(a)) + Math.PI }
}

/** Seat pose in WORLD space when the ride is at rest (rotation 0) — used for boarding walks. */
export function seatWorldAtRest(c: RideConfig, row: number, col: number): SeatPose {
  switch (c.rideType) {
    case 'coaster': {
      const seats = c.rowSeats[row] ?? 1
      return {
        x: coasterRowX(c, row),
        z: TRACK_Z + (col - (seats - 1) / 2) * SEAT_SPACING,
        ry: Math.PI / 2, // face +x, direction of travel
      }
    }
    case 'theater': {
      const seats = c.rowSeats[row] ?? 1
      return {
        x: (col - (seats - 1) / 2) * SEAT_SPACING,
        z: TRACK_Z - 1.2 - (totalRows(c) - 1 - row) * 0.9,
        ry: Math.PI, // face the screen at the back
      }
    }
    case 'continuous': {
      const p = contSeatLocal(c, row, col)
      return { x: p.x, z: p.z, ry: p.ry } // boarding is automatic; rarely used
    }
    default: {
      const p = roundSeatLocal(c, row, col)
      return { x: p.x, z: p.z + ROUND_CENTER_Z, ry: p.ry }
    }
  }
}

// --- Queue -----------------------------------------------------------------

export function queueBaseX(c: RideConfig) {
  const leftExtent =
    c.rideType === 'carousel' || c.rideType === 'spinner'
      ? Math.max(carouselRadii(c).outer + 2, loadZoneWidth(c) / 2 + 2)
      : c.rideType === 'coaster'
        ? coasterTrainLength(c) / 2 + 2
        : loadZoneWidth(c) / 2 + 4
  return -Math.max(6, leftExtent) - 2.5
}

/** Serpentine slot: pairs snake through switchback lanes toward the front. */
function serpentineSlot(baseX: number, pair: number, side: number) {
  const lane = Math.floor(pair / Q_LANE_PAIRS)
  const within = pair % Q_LANE_PAIRS
  const forward = lane % 2 === 0
  const z = 1.6 + (forward ? within : Q_LANE_PAIRS - 1 - within) * Q_PAIR_SPACING
  return { x: baseX - lane * Q_LANE_GAP + (side === 0 ? 0.28 : -0.28), z }
}

export function grouperPos(c: RideConfig) {
  return { x: queueBaseX(c), z: 0.5 }
}

export function singleRiderSlot(c: RideConfig, index: number) {
  return { x: queueBaseX(c) + 1.6, z: 1.6 + index * 0.75 }
}

export function evenQueueBaseX(c: RideConfig) {
  return queueBaseX(c) - Q_LANE_PAIRS * 0 - 3.4
}

export interface GuestTarget {
  x: number
  z: number
}

/**
 * Computes the world position every queued guest should stand at.
 * Queues fill two-by-two; a group with an odd count leaves an empty
 * space so the next group starts on a fresh pair. With even/odd mode,
 * even-sized groups queue in a second serpentine beside the first.
 */
export function computeQueueTargets(
  c: RideConfig,
  groups: Group[],
  singles: number[],
  guests: Record<number, Guest>,
  evenOdd: boolean,
): Map<number, GuestTarget> {
  const map = new Map<number, GuestTarget>()
  const cursors = [
    { pair: 0, side: 0, baseX: queueBaseX(c) }, // odd (or the only) queue
    { pair: 0, side: 0, baseX: evenQueueBaseX(c) }, // even queue
  ]
  for (const group of groups) {
    if (group.deferred) continue
    const parity = evenOdd && group.guestIds.length % 2 === 0 ? 1 : 0
    const cur = cursors[parity]
    for (const id of group.guestIds) {
      const g = guests[id]
      if (!g || g.state !== 'queue') continue
      map.set(id, serpentineSlot(cur.baseX, cur.pair, cur.side))
      if (cur.side === 0) cur.side = 1
      else {
        cur.side = 0
        cur.pair++
      }
    }
    if (cur.side === 1) {
      cur.side = 0
      cur.pair++
    }
  }
  singles.forEach((id, i) => {
    const g = guests[id]
    if (!g || g.state !== 'queue') return
    map.set(id, singleRiderSlot(c, i))
  })
  return map
}

/** Waiting area (deferred row-request groups): three marked rows right of the queue. */
export function waitingSlot(c: RideConfig, slot: number, member: number) {
  return {
    x: queueBaseX(c) + 3.4 + member * 0.6,
    z: 2.2 + slot * 1.1,
  }
}

// --- Camera ----------------------------------------------------------------

export function sceneFocus(c: RideConfig, aspect: number) {
  const qx = queueBaseX(c)
  const lanes = Math.ceil(40 / (Q_LANE_PAIRS * 2)) // rough lane estimate for bounds
  const xMin = qx - lanes * Q_LANE_GAP - 6.5
  let xMax = loadZoneWidth(c) / 2 + 4
  let zMin = TRACK_Z - 3
  if (c.rideType === 'coaster') xMax = Math.max(xMax, coasterTrainLength(c) / 2 + 2)
  if (c.rideType === 'carousel' || c.rideType === 'spinner') {
    const r = c.rideType === 'spinner' ? spinnerRowRadius(c, totalRows(c) - 1) + 1.5 : carouselRadii(c).outer
    xMax = Math.max(xMax, r + 1)
    zMin = ROUND_CENTER_Z - r - 1.5
  }
  if (c.rideType === 'theater') zMin = TRACK_Z - 2 - totalRows(c) * 0.9
  const zMax = 1.6 + Q_LANE_PAIRS * Q_PAIR_SPACING + 1.5
  const cx = (xMin + xMax) / 2
  const cz = (zMin + zMax) / 2
  const width = xMax - xMin
  const depth = zMax - zMin
  const tanV = Math.tan((48 * Math.PI) / 360)
  const distW = (width / 2 / (tanV * Math.max(0.3, aspect))) * 1.08
  const distD = (depth / 2 / tanV) * 0.82
  const dist = Math.min(120, Math.max(14, Math.max(distW, distD)))
  return { cx, cz, dist }
}
