import { create } from 'zustand'
import { sampleGroupSize } from './logic/groups'
import { totalRows } from './logic/layout'
import {
  DEFAULT_CONFIG,
  DEFAULT_OPTIONS,
  GUEST_COLORS,
  type GameOptions,
  type Group,
  type Guest,
  type Phase,
  type RideConfig,
  type VehicleStat,
} from './types'

let nextGroupId = 1
let nextGuestId = 1

/** Per-ride-type animation timing (ms). */
export const TIMING = {
  interval: { dispatch: 1400, arrive: 1000 },
  continuous: { dispatch: 900, arrive: 500 },
  stopgo: { dispatch: 1600, arrive: 2400 },
} as const

export interface GameState {
  screen: 'landing' | 'game' | 'complete'
  optionsOpen: boolean
  config: RideConfig
  options: GameOptions

  groups: Group[]
  singles: number[]
  guests: Record<number, Guest>
  selection: number[]
  rows: (number | null)[][]

  phase: Phase
  phaseAt: number
  vehicleNumber: number
  colorCounter: number
  session: number

  timerDeadline: number | null
  vehicleStartedAt: number
  roundStartedAt: number
  stats: VehicleStat[]
  departing: { id: number; row: number; col: number; colorIndex?: number; single: boolean }[]

  toast: { id: number; text: string } | null
  flashRow: { row: number; until: number } | null

  setConfig: (patch: Partial<RideConfig>) => void
  setOptions: (patch: Partial<GameOptions>) => void
  setOptionsOpen: (open: boolean) => void
  startGame: () => void
  tapGuest: (id: number) => void
  tapRow: (row: number) => void
  sendVehicle: (auto?: boolean) => void
  callFor: (size: number) => void
  showToast: (text: string) => void
  backToLanding: (openOptions: boolean) => void
}

function makeGroup(state: {
  options: GameOptions
  colorCounter: number
  guests: Record<number, Guest>
}): { group: Group; colorCounter: number } {
  const size = sampleGroupSize(state.options.maxGroupSize)
  const groupId = nextGroupId++
  const guestIds: number[] = []
  for (let i = 0; i < size; i++) {
    const id = nextGuestId++
    state.guests[id] = { id, groupId, single: false, state: 'queue' }
    guestIds.push(id)
  }
  // With "Tap to Show Groups" off, every group starts revealed and colored.
  const revealed = !state.options.tapToShow
  const colorIndex = revealed ? state.colorCounter % GUEST_COLORS.length : 0
  return {
    group: { id: groupId, guestIds, revealed, colorIndex },
    colorCounter: revealed ? state.colorCounter + 1 : state.colorCounter,
  }
}

function queuedGuestCount(groups: Group[], guests: Record<number, Guest>) {
  let n = 0
  for (const g of groups) for (const id of g.guestIds) if (guests[id]?.state === 'queue') n++
  return n
}

/** Tops up the standby queue and single rider line. Mutates the passed copies. */
function refill(draft: {
  groups: Group[]
  singles: number[]
  guests: Record<number, Guest>
  options: GameOptions
  colorCounter: number
}) {
  let safety = 200
  while (queuedGuestCount(draft.groups, draft.guests) < draft.options.visibleGuests && safety-- > 0) {
    const { group, colorCounter } = makeGroup(draft)
    draft.groups.push(group)
    draft.colorCounter = colorCounter
  }
  if (draft.options.singleRider) {
    while (draft.singles.length < 8) {
      const id = nextGuestId++
      draft.guests[id] = { id, groupId: -1, single: true, state: 'queue' }
      draft.singles.push(id)
    }
  }
}

export const useGame = create<GameState>()((set, get) => ({
  screen: 'landing',
  optionsOpen: false,
  config: { ...DEFAULT_CONFIG },
  options: { ...DEFAULT_OPTIONS },

  groups: [],
  singles: [],
  guests: {},
  selection: [],
  rows: [],

  phase: 'arriving',
  phaseAt: 0,
  vehicleNumber: 1,
  colorCounter: 0,
  session: 0,

  timerDeadline: null,
  vehicleStartedAt: 0,
  roundStartedAt: 0,
  stats: [],
  departing: [],

  toast: null,
  flashRow: null,

  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  setOptions: (patch) => set((s) => ({ options: { ...s.options, ...patch } })),
  setOptionsOpen: (open) => set({ optionsOpen: open }),

  startGame: () => {
    const { config, options } = get()
    const session = get().session + 1
    const draft = {
      groups: [] as Group[],
      singles: [] as number[],
      guests: {} as Record<number, Guest>,
      options,
      colorCounter: 0,
    }
    refill(draft)
    const now = Date.now()
    const nRows = totalRows(config)
    set({
      screen: 'game',
      optionsOpen: false,
      session,
      groups: draft.groups,
      singles: draft.singles,
      guests: draft.guests,
      colorCounter: draft.colorCounter,
      selection: [],
      rows: Array.from({ length: nRows }, () => Array(config.guestsPerRow).fill(null)),
      phase: 'arriving',
      phaseAt: now,
      vehicleNumber: 1,
      timerDeadline: null,
      vehicleStartedAt: now,
      roundStartedAt: now,
      stats: [],
      departing: [],
      toast: null,
      flashRow: null,
    })
    const arriveMs = get().config.rideType === 'stopgo' ? 1200 : TIMING[config.rideType].arrive
    setTimeout(() => {
      if (get().session !== session || get().screen !== 'game') return
      const t = Date.now()
      set({
        phase: 'loading',
        phaseAt: t,
        vehicleStartedAt: t,
        timerDeadline: options.timedMode ? t + options.timerSeconds * 1000 : null,
      })
    }, arriveMs)
  },

  showToast: (text) => set({ toast: { id: Date.now(), text } }),

  tapGuest: (id) => {
    const s = get()
    if (s.screen !== 'game' || s.phase !== 'loading') return
    const guest = s.guests[id]
    if (!guest || guest.state !== 'queue') return
    const capacity = s.config.guestsPerRow
    const selection = s.selection.filter((x) => s.guests[x]?.state === 'queue')

    if (guest.single) {
      if (selection.includes(id)) {
        set({ selection: selection.filter((x) => x !== id) })
        return
      }
      const allSingles = selection.length > 0 && selection.every((x) => s.guests[x]?.single)
      if (selection.length === 0 || !allSingles) {
        set({ selection: [id] })
      } else if (selection.length < capacity) {
        set({ selection: [...selection, id] })
      } else {
        get().showToast(`Rows hold ${capacity} guest${capacity === 1 ? '' : 's'}`)
      }
      return
    }

    const group = s.groups.find((g) => g.id === guest.groupId)
    if (!group) return

    if (!group.revealed) {
      // First tap activates the whole party: gray -> next color in rotation.
      const colorIndex = s.colorCounter % GUEST_COLORS.length
      set({
        groups: s.groups.map((g) =>
          g.id === group.id ? { ...g, revealed: true, colorIndex } : g,
        ),
        colorCounter: s.colorCounter + 1,
        selection: [id],
      })
      return
    }

    if (selection.includes(id)) {
      set({ selection: selection.filter((x) => x !== id) })
      return
    }

    const sameGroup =
      selection.length > 0 &&
      !s.guests[selection[0]]?.single &&
      s.guests[selection[0]]?.groupId === group.id

    if (!sameGroup) {
      if (!s.options.tapToShow) {
        // Always-visible mode: tapping selects the whole group (up to row capacity).
        const ids = group.guestIds
          .filter((gid) => s.guests[gid]?.state === 'queue')
          .slice(0, capacity)
        set({ selection: ids })
      } else {
        set({ selection: [id] })
      }
      return
    }

    if (selection.length >= capacity) {
      get().showToast(`Rows hold ${capacity} guest${capacity === 1 ? '' : 's'}`)
      return
    }
    set({ selection: [...selection, id] })
  },

  tapRow: (row) => {
    const s = get()
    if (s.screen !== 'game' || s.phase !== 'loading') return
    const selection = s.selection.filter((x) => s.guests[x]?.state === 'queue')
    if (selection.length === 0) {
      get().showToast('Select guests first')
      return
    }
    const seats = s.rows[row]
    if (!seats) return
    const emptyCols: number[] = []
    for (let c = seats.length - 1; c >= 0; c--) if (seats[c] === null) emptyCols.push(c) // fill right to left
    if (selection.length > emptyCols.length) {
      const flashSession = s.session
      set({ flashRow: { row, until: Date.now() + 650 } })
      setTimeout(() => {
        if (get().session === flashSession) set({ flashRow: null })
      }, 700)
      get().showToast('Too many guests for this row')
      return
    }

    const guests = { ...s.guests }
    const rows = s.rows.map((r) => [...r])
    selection.forEach((id, i) => {
      const col = emptyCols[i]
      rows[row][col] = id
      const group = s.groups.find((g) => g.id === guests[id].groupId)
      guests[id] = {
        ...guests[id],
        state: 'loaded',
        seatRow: row,
        seatCol: col,
        colorIndex: group?.colorIndex,
      }
    })

    // Remove placed guests from the queue structures.
    const groups = s.groups
      .map((g) => ({ ...g, guestIds: g.guestIds.filter((id) => !selection.includes(id)) }))
      .filter((g) => g.guestIds.length > 0)
    const singles = s.singles.filter((id) => !selection.includes(id))

    const draft = { groups, singles, guests, options: s.options, colorCounter: s.colorCounter }
    refill(draft)

    set({
      guests: draft.guests,
      groups: draft.groups,
      singles: draft.singles,
      colorCounter: draft.colorCounter,
      rows,
      selection: [],
    })

    // After walking to the load circle, guests hop into their seats.
    const session = s.session
    const placed = [...selection]
    setTimeout(() => {
      if (get().session !== session) return
      const g2 = { ...get().guests }
      let changed = false
      for (const id of placed) {
        if (g2[id]?.state === 'loaded') {
          g2[id] = { ...g2[id], state: 'seated' }
          changed = true
        }
      }
      if (changed) set({ guests: g2 })
    }, 1000)
  },

  sendVehicle: (auto = false) => {
    const s = get()
    if (s.screen !== 'game' || s.phase !== 'loading') return
    const loaded = Object.values(s.guests).filter(
      (g) => g.state === 'loaded' || g.state === 'seated',
    )
    if (!auto && loaded.length === 0) {
      get().showToast('Place at least one guest first')
      return
    }
    const seats = totalRows(s.config) * s.config.guestsPerRow
    const stat: VehicleStat = {
      seats,
      filled: loaded.length,
      seconds: (Date.now() - s.vehicleStartedAt) / 1000,
    }
    const guests = { ...s.guests }
    for (const g of loaded) delete guests[g.id]
    const now = Date.now()
    set({
      stats: [...s.stats, stat],
      departing: loaded.map((g) => ({
        id: g.id,
        row: g.seatRow!,
        col: g.seatCol!,
        colorIndex: g.colorIndex,
        single: g.single,
      })),
      guests,
      rows: s.rows.map((r) => r.map(() => null)),
      selection: [],
      phase: 'dispatching',
      phaseAt: now,
      timerDeadline: null,
    })

    const session = s.session
    const timing = TIMING[s.config.rideType]
    const isLast = s.vehicleNumber >= s.options.vehiclesToLoad
    setTimeout(() => {
      if (get().session !== session || get().screen !== 'game') return
      if (isLast) {
        set({ screen: 'complete', departing: [] })
        return
      }
      set({
        vehicleNumber: get().vehicleNumber + 1,
        phase: 'arriving',
        phaseAt: Date.now(),
        departing: [],
      })
      setTimeout(() => {
        if (get().session !== session || get().screen !== 'game') return
        const t = Date.now()
        set({
          phase: 'loading',
          phaseAt: t,
          vehicleStartedAt: t,
          timerDeadline: get().options.timedMode
            ? t + get().options.timerSeconds * 1000
            : null,
        })
      }, timing.arrive)
    }, timing.dispatch)
  },

  callFor: (size) => {
    const s = get()
    if (s.screen !== 'game' || s.phase !== 'loading') return
    const idx = s.groups.findIndex((g, i) => {
      const inQueue = g.guestIds.filter((id) => s.guests[id]?.state === 'queue')
      if (inQueue.length !== size) return false
      if (i === 0 && g.revealed) return false // already at the front and active
      return true
    })
    if (idx === -1) {
      get().showToast(`No group of ${size} available`)
      return
    }
    const groups = [...s.groups]
    const [group] = groups.splice(idx, 1)
    const revealed = group.revealed
    const colorIndex = revealed ? group.colorIndex : s.colorCounter % GUEST_COLORS.length
    groups.unshift({ ...group, revealed: true, colorIndex })
    set({
      groups,
      colorCounter: revealed ? s.colorCounter : s.colorCounter + 1,
    })
  },

  backToLanding: (openOptions) =>
    set((s) => ({
      screen: 'landing',
      optionsOpen: openOptions,
      session: s.session + 1,
      timerDeadline: null,
    })),
}))
