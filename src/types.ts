export type RideType = 'interval' | 'continuous' | 'stopgo'

export type Phase = 'loading' | 'dispatching' | 'arriving'

export interface RideConfig {
  rideType: RideType
  sections: number // 1-100, vehicle divisions (cars of a train)
  rowsPerSection: number // 1-20
  guestsPerRow: number // 1-20
}

export interface GameOptions {
  timedMode: boolean
  timerSeconds: number // 30 - 600
  visibleGuests: number // 10-100
  maxGroupSize: number // 1-40
  tapToShow: boolean
  vehiclesToLoad: number // 1-10
  singleRider: boolean
  callFor: boolean
}

export interface Group {
  id: number
  guestIds: number[] // members still in the queue
  revealed: boolean
  colorIndex: number
}

export interface Guest {
  id: number
  groupId: number // -1 for single riders
  single: boolean
  state: 'queue' | 'loaded' | 'seated'
  seatRow?: number
  seatCol?: number
  colorIndex?: number // stamped when placed, so seated guests keep their party color
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
  interval: {
    label: 'Interval Batch Loader',
    icon: '🚂',
    blurb: 'The vehicle arrives empty, loads fully, then dispatches. Short, focused grouping windows.',
  },
  continuous: {
    label: 'Continuous Mover',
    icon: '🎠',
    blurb: 'A chain of vehicles passes through the load area. Quick grouping decisions in rapid succession.',
  },
  stopgo: {
    label: 'Stop & Go Single Vehicle',
    icon: '🚤',
    blurb: 'One vehicle loads, runs the attraction, then returns. Group the next set before it comes back!',
  },
}

export const DEFAULT_CONFIG: RideConfig = {
  rideType: 'interval',
  sections: 5,
  rowsPerSection: 2,
  guestsPerRow: 2,
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
}
