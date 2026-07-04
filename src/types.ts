export type RideType = 'coaster' | 'carousel' | 'spinner' | 'continuous' | 'theater'

export type Phase = 'arriving' | 'loading' | 'dispatching' | 'riding' | 'unloading'

export interface RideConfig {
  rideType: RideType
  // coaster
  sections: number // 1-10
  rowsPerSection: number // 1-5
  // spinner
  spokes: number // 3-12
  rowsPerSpoke: number // 1-3
  // carousel
  carouselRows: number // 3-16
  // theater
  theaterRows: number // 1-8
  theaterSubs: number // 1-4, subsections per row
  subSeats: number[] // guests per subsection (theater), length = theaterSubs
  // continuous
  loadSpots: number // 2-4
  // canonical per-row seat counts for the active shape (theater derives from subSeats)
  rowSeats: number[]
  // carousel / spinner / theater ride duration (spin ~5 turns over this time)
  rideSeconds: number
}

export interface GameOptions {
  timedMode: boolean
  timerSeconds: number // 30-600
  visibleGuests: number // 10-100
  maxGroupSize: number // 1-40
  tapToShow: boolean
  vehiclesToLoad: number // 1-10
  singleRider: boolean
  callFor: boolean
  evenOdd: boolean
  rowRequests: boolean
  doubleGrouping: boolean
}

export interface Group {
  id: number
  guestIds: number[] // members still in the queue
  revealed: boolean
  colorIndex: number
  requestedRow: number | null // row requests feature (1-based label)
  deferred: boolean // parked in the waiting area
}

export interface Guest {
  id: number
  groupId: number // -1 for single riders
  single: boolean
  state: 'queue' | 'loaded' | 'seated' | 'leaving'
  seatRow?: number
  seatCol?: number
  staged?: boolean // on the second-rank (double grouping / during-ride) circles
  spot?: number // continuous mover loading spot
  vehicleId?: number // continuous mover vehicle the guest boarded
  colorIndex?: number
}

export interface ContVehicle {
  id: number
  /** world x offset at t=0; position = offset + speed * elapsed */
  offset: number
  seats: (number | null)[][]
  counted: boolean
}

export interface VehicleStat {
  seats: number
  filled: number
  seconds: number
}

export const GUEST_COLORS = [
  '#4A90E2', // blue
  '#E74C3C', // red
  '#27AE60', // green
  '#F39C12', // yellow
  '#E67E22', // orange
  '#9B59B6', // purple
]

export const GRAY = '#95A5A6'
export const SINGLE_RIDER_COLOR = '#2C3E50'

export const RIDE_TYPE_INFO: Record<RideType, { label: string; icon: string; blurb: string }> = {
  coaster: {
    label: 'Roller Coaster',
    icon: '🎢',
    blurb: 'The train loads in the station, then dispatches to run the course. Short, focused grouping windows.',
  },
  carousel: {
    label: 'Carousel',
    icon: '🎠',
    blurb: 'Rows spaced around a spinning platform. Load, spin, unload — then do it all again.',
  },
  spinner: {
    label: 'Flying Spinner',
    icon: '🛸',
    blurb: 'Hub-and-spoke cars facing the spin. Load every spoke, send it flying, then reload.',
  },
  continuous: {
    label: 'Continuous Mover',
    icon: '💺',
    blurb: 'Small vehicles that never stop moving. Stage guests at the loading spots and time it right!',
  },
  theater: {
    label: 'Small Theater',
    icon: '🎭',
    blurb: 'A stationary theater. Fill the rows, run the show, and stage the next audience while it plays.',
  },
}

export function defaultConfigFor(rideType: RideType): RideConfig {
  const base: RideConfig = {
    rideType,
    sections: 5,
    rowsPerSection: 2,
    spokes: 6,
    rowsPerSpoke: 1,
    carouselRows: 8,
    theaterRows: 4,
    theaterSubs: 2,
    subSeats: [4, 4],
    loadSpots: 3,
    rowSeats: [],
    rideSeconds: 20,
  }
  base.rowSeats = deriveRowSeats(base)
  return base
}

/** Number of game rows implied by the shape parameters of the active ride type. */
export function shapeRowCount(c: RideConfig): number {
  switch (c.rideType) {
    case 'coaster':
      return c.sections * c.rowsPerSection
    case 'carousel':
      return c.carouselRows
    case 'spinner':
      return c.spokes * c.rowsPerSpoke
    case 'continuous':
      return Math.min(6, Math.max(1, c.rowSeats.length || 1))
    case 'theater':
      return c.theaterRows
  }
}

/** Rebuild rowSeats to match the shape, preserving user-entered per-row values. */
export function deriveRowSeats(c: RideConfig): number[] {
  if (c.rideType === 'theater') {
    const perRow = c.subSeats.reduce((a, b) => a + b, 0)
    return Array.from({ length: c.theaterRows }, () => perRow)
  }
  const n = c.rideType === 'continuous' ? c.rowSeats.length || 1 : shapeRowCount(c)
  const def = c.rideType === 'continuous' ? 2 : 2
  return Array.from({ length: n }, (_, i) => c.rowSeats[i] ?? def)
}

export function totalSeats(c: RideConfig): number {
  return c.rowSeats.reduce((a, b) => a + b, 0)
}

export const DEFAULT_OPTIONS: GameOptions = {
  timedMode: false,
  timerSeconds: 120,
  visibleGuests: 30,
  maxGroupSize: 20,
  tapToShow: true,
  vehiclesToLoad: 3,
  singleRider: true,
  callFor: true,
  evenOdd: false,
  rowRequests: false,
  doubleGrouping: false,
}
