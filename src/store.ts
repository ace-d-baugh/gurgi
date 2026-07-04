import { create } from 'zustand'
import { sampleGroupSize } from './logic/groups'
import {
  CONT_GAP,
  CONT_SPEED,
  contLength,
  loadZoneWidth,
  maxRowSeats,
  rowLoadX,
  seatWorldAtRest,
  totalRows,
} from './logic/layout'
import {
  DEFAULT_OPTIONS,
  GUEST_COLORS,
  defaultConfigFor,
  totalSeats,
  type ContVehicle,
  type GameOptions,
  type Group,
  type Guest,
  type Phase,
  type RideConfig,
  type RideType,
  type VehicleStat,
} from './types'

let nextGroupId = 1
let nextGuestId = 1
let nextVehicleId = 1

/** Animation timing (ms). */
export const TIMING = {
  dispatch: 1400, // coaster train leaving
  arrive: 1000, // coaster train arriving
  unload: 2600, // riders climbing out and walking off screen
}

const ROW_REQUEST_CHANCE = 0.28
const WAITING_SLOTS = 3

export interface Leaver {
  id: number
  fromX: number
  fromZ: number
  colorIndex?: number
  single: boolean
  bornAt: number
}

export interface GameState {
  screen: 'landing' | 'game' | 'complete'
  optionsOpen: boolean
  config: RideConfig
  options: GameOptions

  groups: Group[]
  singles: number[]
  guests: Record<number, Guest>
  selection: number[]
  rows: (number | null)[][] // current vehicle occupancy
  staged: (number | null)[][] // second-rank circles (double grouping / during ride)

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
  leavers: Leaver[]
  dispatchCount: number // increments on every send; drives the background coaster run

  // continuous mover
  contVehicles: ContVehicle[]
  contStartAt: number

  toast: { id: number; text: string } | null
  flashRow: { row: number; until: number } | null

  setRideType: (rt: RideType) => void
  setConfig: (patch: Partial<RideConfig>) => void
  setOptions: (patch: Partial<GameOptions>) => void
  setOptionsOpen: (open: boolean) => void
  startGame: () => void
  tapGuest: (id: number) => void
  tapRow: (row: number) => void
  sendVehicle: (auto?: boolean) => void
  callFor: (size: number) => void
  deferGroup: () => void
  contTick: (now: number) => void
  showToast: (text: string) => void
  backToLanding: (openOptions: boolean) => void
}

function makeGroup(draft: {
  options: GameOptions
  colorCounter: number
  guests: Record<number, Guest>
  config: RideConfig
}): { group: Group; colorCounter: number } {
  const size = sampleGroupSize(draft.options.maxGroupSize)
  const groupId = nextGroupId++
  const guestIds: number[] = []
  for (let i = 0; i < size; i++) {
    const id = nextGuestId++
    draft.guests[id] = { id, groupId, single: false, state: 'queue' }
    guestIds.push(id)
  }
  const revealed = !draft.options.tapToShow
  const colorIndex = revealed ? draft.colorCounter % GUEST_COLORS.length : 0
  const requestedRow =
    draft.options.rowRequests && Math.random() < ROW_REQUEST_CHANCE
      ? 1 + Math.floor(Math.random() * totalRows(draft.config))
      : null
  return {
    group: { id: groupId, guestIds, revealed, colorIndex, requestedRow, deferred: false },
    colorCounter: revealed ? draft.colorCounter + 1 : draft.colorCounter,
  }
}

function queuedGuestCount(groups: Group[], guests: Record<number, Guest>) {
  let n = 0
  for (const g of groups) {
    if (g.deferred) continue
    for (const id of g.guestIds) if (guests[id]?.state === 'queue') n++
  }
  return n
}

function refill(draft: {
  groups: Group[]
  singles: number[]
  guests: Record<number, Guest>
  options: GameOptions
  colorCounter: number
  config: RideConfig
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

function emptyRows(config: RideConfig): (number | null)[][] {
  if (config.rideType === 'continuous') {
    // For continuous movers, `rows` holds the loading SPOTS: staging pads whose
    // guests auto-board a passing vehicle. A pad never holds more than one
    // vehicle's worth of guests (max 4 circles).
    const slots = Math.min(4, totalSeats(config))
    return Array.from({ length: config.loadSpots }, () => Array<number | null>(slots).fill(null))
  }
  return config.rowSeats.map((seats) => Array<number | null>(seats).fill(null))
}

function makeContFleet(config: RideConfig): ContVehicle[] {
  // Vehicles spread leftward from just before the leftmost loading spot, so the
  // first one reaches the spots a few seconds into the round.
  const pitch = contLength(config) + CONT_GAP
  const firstX = rowLoadX(config, 0) - 4
  const count = 14
  return Array.from({ length: count }, (_, i) => ({
    id: nextVehicleId++,
    offset: firstX - i * pitch,
    seats: emptyRows(config),
    counted: false,
  }))
}

/** Uses ride-run + unload phases instead of dispatch/arrive (round & theater rides). */
function isCycleRide(rt: RideType) {
  return rt === 'carousel' || rt === 'spinner' || rt === 'theater'
}

export const useGame = create<GameState>()((set, get) => ({
  screen: 'landing',
  optionsOpen: false,
  config: defaultConfigFor('coaster'),
  options: { ...DEFAULT_OPTIONS },

  groups: [],
  singles: [],
  guests: {},
  selection: [],
  rows: [],
  staged: [],

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
  leavers: [],
  dispatchCount: 0,

  contVehicles: [],
  contStartAt: 0,

  toast: null,
  flashRow: null,

  setRideType: (rt) => set({ config: defaultConfigFor(rt) }),
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
      config,
    }
    refill(draft)
    const now = Date.now()
    const continuous = config.rideType === 'continuous'
    set({
      screen: 'game',
      optionsOpen: false,
      session,
      groups: draft.groups,
      singles: draft.singles,
      guests: draft.guests,
      colorCounter: draft.colorCounter,
      selection: [],
      rows: emptyRows(config),
      staged: emptyRows(config),
      phase: continuous ? 'loading' : 'arriving',
      phaseAt: now,
      vehicleNumber: 1,
      timerDeadline: null,
      vehicleStartedAt: now,
      roundStartedAt: now,
      stats: [],
      departing: [],
      leavers: [],
      dispatchCount: 0,
      contVehicles: continuous ? makeContFleet(config) : [],
      contStartAt: now,
      toast: null,
      flashRow: null,
    })
    if (!continuous) {
      setTimeout(() => {
        if (get().session !== session || get().screen !== 'game') return
        const t = Date.now()
        set({
          phase: 'loading',
          phaseAt: t,
          vehicleStartedAt: t,
          timerDeadline: options.timedMode ? t + options.timerSeconds * 1000 : null,
        })
      }, TIMING.arrive)
    }
  },

  showToast: (text) => set({ toast: { id: Date.now(), text } }),

  tapGuest: (id) => {
    const s = get()
    if (s.screen !== 'game') return
    const guest = s.guests[id]
    if (!guest || guest.state !== 'queue') return
    const capacity =
      s.config.rideType === 'continuous'
        ? Math.min(4, totalSeats(s.config))
        : maxRowSeats(s.config)
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
        get().showToast(`Rows hold at most ${capacity} guest${capacity === 1 ? '' : 's'}`)
      }
      return
    }

    const group = s.groups.find((g) => g.id === guest.groupId)
    if (!group) return

    if (!group.revealed) {
      const colorIndex = s.colorCounter % GUEST_COLORS.length
      set({
        groups: s.groups.map((g) => (g.id === group.id ? { ...g, revealed: true, colorIndex } : g)),
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
        const ids = group.guestIds.filter((gid) => s.guests[gid]?.state === 'queue').slice(0, capacity)
        set({ selection: ids })
      } else {
        set({ selection: [id] })
      }
      return
    }

    if (selection.length >= capacity) {
      get().showToast(`Rows hold at most ${capacity} guest${capacity === 1 ? '' : 's'}`)
      return
    }
    set({ selection: [...selection, id] })
  },

  tapRow: (row) => {
    const s = get()
    if (s.screen !== 'game') return
    const continuous = s.config.rideType === 'continuous'
    if (!continuous && s.phase !== 'loading' && s.phase !== 'riding' && s.phase !== 'unloading') return
    const selection = s.selection.filter((x) => s.guests[x]?.state === 'queue')
    if (selection.length === 0) {
      get().showToast('Select guests first')
      return
    }

    // Where do these guests go? Primary circles feed the current vehicle; the
    // staged rank pre-loads the next one (double grouping / during a ride run).
    const vehicleBusy = !continuous && s.phase !== 'loading'
    const primary = s.rows[row]
    if (!primary) return
    const primaryFree = primary.filter((x) => x === null).length
    let useStaged = false
    if (continuous) {
      useStaged = false // spots stage directly into `rows`; boarding is automatic
    } else if (vehicleBusy) {
      if (!isCycleRide(s.config.rideType) && !s.options.doubleGrouping) {
        get().showToast('Wait for the next vehicle')
        return
      }
      useStaged = true
    } else if (selection.length > primaryFree) {
      if (s.options.doubleGrouping && primaryFree === 0) useStaged = true
    }

    const grid = useStaged ? s.staged : s.rows
    const seats = grid[row]
    const emptyCols: number[] = []
    for (let cIdx = 0; cIdx < seats.length; cIdx++) if (seats[cIdx] === null) emptyCols.push(cIdx) // left to right
    if (selection.length > emptyCols.length) {
      const flashSession = s.session
      set({ flashRow: { row, until: Date.now() + 650 } })
      setTimeout(() => {
        if (get().session === flashSession) set({ flashRow: null })
      }, 700)
      get().showToast(useStaged ? 'Not enough staged spots in this row' : 'Too many guests for this row')
      return
    }

    const guests = { ...s.guests }
    const rows = s.rows.map((r) => [...r])
    const staged = s.staged.map((r) => [...r])
    const target = useStaged ? staged : rows
    selection.forEach((id, i) => {
      const col = emptyCols[i]
      target[row][col] = id
      const group = s.groups.find((g) => g.id === guests[id].groupId)
      guests[id] = {
        ...guests[id],
        state: 'loaded',
        seatRow: row,
        seatCol: col,
        staged: useStaged,
        colorIndex: group?.colorIndex,
      }
    })

    // Row request feedback
    const firstGroup = s.groups.find((g) => g.id === guests[selection[0]].groupId)
    if (firstGroup?.requestedRow != null && firstGroup.requestedRow === row + 1) {
      get().showToast(`Row ${row + 1} request honored! 🙌`)
    }

    const groups = s.groups
      .map((g) => ({
        ...g,
        guestIds: g.guestIds.filter((id) => !selection.includes(id)),
      }))
      .filter((g) => g.guestIds.length > 0)
    const singles = s.singles.filter((id) => !selection.includes(id))

    const draft = { groups, singles, guests, options: s.options, colorCounter: s.colorCounter, config: s.config }
    refill(draft)

    set({
      guests: draft.guests,
      groups: draft.groups,
      singles: draft.singles,
      colorCounter: draft.colorCounter,
      rows,
      staged,
      selection: [],
    })

    // Primary-circle guests hop into their seats after walking over
    // (not for continuous movers — those board automatically on alignment).
    if (!useStaged && !continuous) {
      const session = s.session
      const placed = [...selection]
      setTimeout(() => {
        if (get().session !== session) return
        if (get().phase !== 'loading') return
        const g2 = { ...get().guests }
        let changed = false
        for (const id of placed) {
          if (g2[id]?.state === 'loaded' && !g2[id].staged) {
            g2[id] = { ...g2[id], state: 'seated' }
            changed = true
          }
        }
        if (changed) set({ guests: g2 })
      }, 1000)
    }
  },

  sendVehicle: (auto = false) => {
    const s = get()
    if (s.screen !== 'game' || s.phase !== 'loading') return
    if (s.config.rideType === 'continuous') return
    const loaded = Object.values(s.guests).filter(
      (g) => (g.state === 'loaded' || g.state === 'seated') && !g.staged,
    )
    if (!auto && loaded.length === 0) {
      get().showToast('Place at least one guest first')
      return
    }
    const seats = totalSeats(s.config)
    const stat: VehicleStat = {
      seats,
      filled: loaded.length,
      seconds: (Date.now() - s.vehicleStartedAt) / 1000,
    }
    const now = Date.now()
    const session = s.session
    const isLast = s.vehicleNumber >= s.options.vehiclesToLoad
    const cycle = isCycleRide(s.config.rideType)

    if (cycle) {
      // Riders stay on board (state 'seated') while the ride runs.
      const g2 = { ...s.guests }
      for (const g of loaded) g2[g.id] = { ...g2[g.id], state: 'seated' }
      set({
        stats: [...s.stats, stat],
        guests: g2,
        selection: s.selection.filter((id) => g2[id]?.state === 'queue'),
        phase: 'riding',
        phaseAt: now,
        timerDeadline: null,
        dispatchCount: s.dispatchCount + 1,
      })
      setTimeout(() => {
        if (get().session !== session || get().screen !== 'game') return
        // Unload: riders climb out and walk off screen.
        const st = get()
        const guests = { ...st.guests }
        const leavers: Leaver[] = [...st.leavers]
        const born = Date.now()
        st.rows.forEach((row, ri) => {
          row.forEach((id, ci) => {
            if (id === null) return
            const g = guests[id]
            if (!g) return
            const p = seatWorldAtRest(st.config, ri, ci)
            leavers.push({
              id,
              fromX: p.x,
              fromZ: p.z,
              colorIndex: g.colorIndex,
              single: g.single,
              bornAt: born,
            })
            delete guests[id]
          })
        })
        set({
          guests,
          leavers,
          rows: emptyRows(st.config),
          phase: 'unloading',
          phaseAt: Date.now(),
        })
        setTimeout(() => {
          if (get().session !== session || get().screen !== 'game') return
          if (isLast) {
            set({ screen: 'complete' })
            return
          }
          promoteStaged(session)
        }, TIMING.unload)
      }, s.config.rideSeconds * 1000)
      return
    }

    // Coaster: train departs to the right with its riders.
    const guests = { ...s.guests }
    for (const g of loaded) delete guests[g.id]
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
      rows: emptyRows(s.config),
      selection: get().selection.filter((id) => guests[id]?.state === 'queue'),
      phase: 'dispatching',
      phaseAt: now,
      timerDeadline: null,
      dispatchCount: s.dispatchCount + 1,
    })

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
        promoteStaged(session)
      }, TIMING.arrive)
    }, TIMING.dispatch)
  },

  callFor: (size) => {
    const s = get()
    if (s.screen !== 'game') return
    // "Call for 1" pulls from the single rider line when one is available.
    if (size === 1 && s.options.singleRider && s.singles.length > 0) {
      const first = s.singles[0]
      if (s.guests[first]?.state === 'queue') {
        set({ selection: [first] })
        get().showToast('Single rider selected')
        return
      }
    }
    const idx = s.groups.findIndex((g, i) => {
      if (g.deferred) return false
      const inQueue = g.guestIds.filter((id) => s.guests[id]?.state === 'queue')
      if (inQueue.length !== size) return false
      if (i === 0 && g.revealed) return false
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
    set({ groups, colorCounter: revealed ? s.colorCounter : s.colorCounter + 1 })
  },

  /** Defer the selected (or front requesting) group to the waiting area. */
  deferGroup: () => {
    const s = get()
    if (s.screen !== 'game') return
    const selGuest = s.selection.length > 0 ? s.guests[s.selection[0]] : undefined
    const group = selGuest && !selGuest.single ? s.groups.find((g) => g.id === selGuest.groupId) : undefined
    if (!group) {
      get().showToast('Select a group to defer')
      return
    }
    const deferredCount = s.groups.filter((g) => g.deferred).length
    if (deferredCount >= WAITING_SLOTS) {
      get().showToast('Waiting area is full (3 groups max)')
      return
    }
    const size = group.guestIds.filter((id) => s.guests[id]?.state === 'queue').length
    if (size > totalSeats(s.config)) {
      get().showToast('Group too large to stage in the waiting area')
      return
    }
    set({
      groups: s.groups.map((g) => (g.id === group.id ? { ...g, deferred: true } : g)),
      selection: [],
    })
    get().showToast('Group moved to the waiting area')
  },

  /** Continuous mover simulation step, driven from the render loop. */
  contTick: (now) => {
    const s = get()
    if (s.screen !== 'game' || s.config.rideType !== 'continuous') return
    const c = s.config
    const elapsed = (now - s.contStartAt) / 1000
    const countX = rowLoadX(c, c.loadSpots - 1) + 3
    const exitX = loadZoneWidth(c) / 2 + 22
    const pitch = contLength(c) + CONT_GAP

    let vehicles = s.contVehicles
    let guests = s.guests
    let rows = s.rows
    let stats = s.stats
    let leavers = s.leavers
    let changed = false
    let finished = false

    const posOf = (v: ContVehicle) => v.offset + elapsed * CONT_SPEED

    // Boarding: a loading spot's staged guests hop in when a vehicle with
    // enough empty seats lines up with the spot.
    for (let spot = 0; spot < c.loadSpots; spot++) {
      const stagedIds = (rows[spot] ?? []).filter((x): x is number => x !== null)
      if (stagedIds.length === 0) continue
      const spotX = rowLoadX(c, spot)
      for (const v of vehicles) {
        const x = posOf(v)
        if (Math.abs(x - spotX) > 0.4) continue
        const free: { row: number; col: number }[] = []
        v.seats.forEach((r, ri) => r.forEach((seat, ci) => seat === null && free.push({ row: ri, col: ci })))
        if (free.length === 0) continue
        const boarding = stagedIds.slice(0, free.length)
        if (boarding.length === 0) continue
        if (!changed) {
          vehicles = vehicles.map((veh) => ({ ...veh, seats: veh.seats.map((r) => [...r]) }))
          guests = { ...guests }
          rows = rows.map((r) => [...r])
          changed = true
        }
        const vRef = vehicles.find((veh) => veh.id === v.id)!
        boarding.forEach((id, i) => {
          const seat = free[i]
          vRef.seats[seat.row][seat.col] = id
          guests[id] = {
            ...guests[id],
            state: 'seated',
            vehicleId: v.id,
            seatRow: seat.row,
            seatCol: seat.col,
          }
          rows[spot] = rows[spot].map((x) => (x === id ? null : x))
        })
        break
      }
    }

    // Count vehicles leaving the load area; recycle ones that leave the screen.
    for (const v of vehicles) {
      const x = posOf(v)
      if (!v.counted && x > countX) {
        if (!changed) {
          vehicles = vehicles.map((veh) => ({ ...veh, seats: veh.seats.map((r) => [...r]) }))
          guests = { ...guests }
          rows = rows.map((r) => [...r])
          changed = true
        }
        const vRef = vehicles.find((veh) => veh.id === v.id)!
        vRef.counted = true
        const filled = vRef.seats.flat().filter((x) => x !== null).length
        stats = [...stats, { seats: vRef.seats.flat().length, filled, seconds: 0 }]
        if (stats.length >= s.options.vehiclesToLoad) finished = true
      }
      if (x > exitX) {
        if (!changed) {
          vehicles = vehicles.map((veh) => ({ ...veh, seats: veh.seats.map((r) => [...r]) }))
          guests = { ...guests }
          rows = rows.map((r) => [...r])
          changed = true
        }
        const vRef = vehicles.find((veh) => veh.id === v.id)!
        for (const id of vRef.seats.flat()) if (id !== null) delete guests[id]
        const minOffset = Math.min(...vehicles.map((veh) => veh.offset))
        vRef.offset = minOffset - pitch
        vRef.seats = emptyRows(c)
        vRef.counted = false
        vRef.id = nextVehicleId++
      }
    }

    // Age out leavers
    if (leavers.some((l) => now - l.bornAt > 6000)) {
      leavers = leavers.filter((l) => now - l.bornAt <= 6000)
      changed = true
    }

    if (changed || finished) {
      set({
        contVehicles: vehicles,
        guests,
        rows,
        stats,
        leavers,
        ...(finished ? { screen: 'complete' as const } : {}),
      })
    }
  },

  backToLanding: (openOptions) =>
    set((s) => ({
      screen: 'landing',
      optionsOpen: openOptions,
      session: s.session + 1,
      timerDeadline: null,
    })),
}))

/** Staged guests advance to the primary circles and board the fresh vehicle. */
function promoteStaged(session: number) {
  const st = useGame.getState()
  if (useGame.getState().session !== session) return
  const guests = { ...st.guests }
  const rows = st.staged.map((r) => [...r])
  for (const row of rows) {
    for (const id of row) {
      if (id !== null && guests[id]) guests[id] = { ...guests[id], staged: false }
    }
  }
  const t = Date.now()
  useGame.setState({
    guests,
    rows,
    staged: emptyRows(st.config),
    phase: 'loading',
    phaseAt: t,
    vehicleNumber: st.config.rideType === 'coaster' ? st.vehicleNumber : st.vehicleNumber + 1,
    vehicleStartedAt: t,
    timerDeadline: st.options.timedMode ? t + st.options.timerSeconds * 1000 : null,
  })
  // Promoted guests walk from the staged circles to the primary ones, then board.
  setTimeout(() => {
    if (useGame.getState().session !== session) return
    if (useGame.getState().phase !== 'loading') return
    const g2 = { ...useGame.getState().guests }
    let changed = false
    for (const row of useGame.getState().rows) {
      for (const id of row) {
        if (id !== null && g2[id]?.state === 'loaded') {
          g2[id] = { ...g2[id], state: 'seated' }
          changed = true
        }
      }
    }
    if (changed) useGame.setState({ guests: g2 })
  }, 1100)
}
