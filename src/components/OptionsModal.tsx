import { motion } from 'framer-motion'
import { useGame } from '../store'
import { RIDE_TYPE_INFO, deriveRowSeats, shapeRowCount, totalSeats, type RideConfig } from '../types'

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          value ? 'bg-fantasy' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            value ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function NumInput({
  label,
  value,
  min,
  max,
  onChange,
  small = false,
}: {
  label?: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  small?: boolean
}) {
  return (
    <label className={small ? 'inline-flex flex-col items-center' : 'flex items-center justify-between gap-2'}>
      {label && (
        <span className={small ? 'text-[10px] font-bold text-slate-400' : 'text-sm font-semibold text-ink'}>
          {label}
        </span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Math.round(Number(e.target.value))
          onChange(Math.min(max, Math.max(min, isNaN(v) ? min : v)))
        }}
        className={`rounded-lg border border-slate-300 font-semibold text-ink ${
          small ? 'w-12 px-1 py-0.5 text-center text-sm' : 'w-20 px-2 py-1'
        }`}
      />
    </label>
  )
}

/** Per-row seat count editor ("some rows differ"). */
function RowSeatsEditor({
  config,
  maxPerRow,
  onChange,
}: {
  config: RideConfig
  maxPerRow: number
  onChange: (rowSeats: number[]) => void
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-ink">
        Guests per row <span className="text-xs font-normal text-slate-500">(each row can differ)</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {config.rowSeats.map((seats, i) => (
          <NumInput
            key={i}
            small
            label={`R${i + 1}`}
            value={seats}
            min={1}
            max={maxPerRow}
            onChange={(v) => {
              const next = [...config.rowSeats]
              next[i] = v
              onChange(next)
            }}
          />
        ))}
      </div>
      <button
        onClick={() => onChange(config.rowSeats.map(() => config.rowSeats[0]))}
        className="mt-1 text-xs font-bold text-fantasy hover:underline"
      >
        Set all rows to match Row 1
      </button>
    </div>
  )
}

function VehicleSection() {
  const config = useGame((s) => s.config)
  const setConfig = useGame((s) => s.setConfig)

  const patchShape = (patch: Partial<RideConfig>) => {
    const next = { ...config, ...patch }
    next.rowSeats = deriveRowSeats(next)
    setConfig(next)
  }

  const rt = config.rideType

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Vehicle — {RIDE_TYPE_INFO[rt].icon} {RIDE_TYPE_INFO[rt].label}
      </div>

      {rt === 'coaster' && (
        <div className="flex flex-wrap gap-4">
          <NumInput label="Sections" value={config.sections} min={1} max={10} onChange={(v) => patchShape({ sections: v })} />
          <NumInput
            label="Rows per section"
            value={config.rowsPerSection}
            min={1}
            max={5}
            onChange={(v) => patchShape({ rowsPerSection: v })}
          />
        </div>
      )}

      {rt === 'carousel' && (
        <div className="flex flex-wrap items-end gap-4">
          <NumInput
            label="Rows (around the circle)"
            value={config.carouselRows}
            min={3}
            max={16}
            onChange={(v) => patchShape({ carouselRows: v })}
          />
          <NumInput
            label="Ride time (sec)"
            value={config.rideSeconds}
            min={5}
            max={120}
            onChange={(v) => setConfig({ rideSeconds: v })}
          />
        </div>
      )}

      {rt === 'spinner' && (
        <div className="flex flex-wrap items-end gap-4">
          <NumInput label="Spokes" value={config.spokes} min={3} max={12} onChange={(v) => patchShape({ spokes: v })} />
          <NumInput
            label="Rows per spoke"
            value={config.rowsPerSpoke}
            min={1}
            max={3}
            onChange={(v) => patchShape({ rowsPerSpoke: v })}
          />
          <NumInput
            label="Ride time (sec)"
            value={config.rideSeconds}
            min={5}
            max={120}
            onChange={(v) => setConfig({ rideSeconds: v })}
          />
        </div>
      )}

      {rt === 'continuous' && (
        <div className="flex flex-wrap items-end gap-4">
          <NumInput
            label="Rows per vehicle"
            value={config.rowSeats.length}
            min={1}
            max={6}
            onChange={(v) => {
              const next = Array.from({ length: v }, (_, i) => config.rowSeats[i] ?? 2)
              setConfig({ rowSeats: next })
            }}
          />
          <NumInput
            label="Loading spots"
            value={config.loadSpots}
            min={2}
            max={4}
            onChange={(v) => setConfig({ loadSpots: v })}
          />
        </div>
      )}

      {rt === 'theater' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-4">
            <NumInput
              label="Rows per box"
              value={config.theaterRows}
              min={1}
              max={8}
              onChange={(v) => patchShape({ theaterRows: v })}
            />
            <NumInput
              label="Subsections per row"
              value={config.theaterSubs}
              min={1}
              max={4}
              onChange={(v) => {
                const subSeats = Array.from({ length: v }, (_, i) => config.subSeats[i] ?? 4)
                patchShape({ theaterSubs: v, subSeats })
              }}
            />
            <NumInput
              label="Show length (sec)"
              value={config.rideSeconds}
              min={5}
              max={300}
              onChange={(v) => setConfig({ rideSeconds: v })}
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold text-ink">
              Guests per subsection <span className="text-xs font-normal text-slate-500">(each can differ)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.subSeats.map((seats, i) => (
                <NumInput
                  key={i}
                  small
                  label={`S${i + 1}`}
                  value={seats}
                  min={1}
                  max={8}
                  onChange={(v) => {
                    const subSeats = [...config.subSeats]
                    subSeats[i] = v
                    patchShape({ subSeats })
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {(rt === 'coaster' || rt === 'carousel' || rt === 'spinner' || rt === 'continuous') && (
        <RowSeatsEditor
          config={config}
          maxPerRow={rt === 'continuous' ? 4 : 10}
          onChange={(rowSeats) => setConfig({ rowSeats })}
        />
      )}

      <div className="text-xs font-medium text-slate-500">
        Vehicle capacity: <b className="text-ink">{totalSeats(config)}</b> guests ·{' '}
        {shapeRowCount(config) === config.rowSeats.length ? config.rowSeats.length : config.rowSeats.length}{' '}
        rows
      </div>
    </div>
  )
}

export function OptionsModal() {
  const config = useGame((s) => s.config)
  const options = useGame((s) => s.options)
  const setOptions = useGame((s) => s.setOptions)
  const setOptionsOpen = useGame((s) => s.setOptionsOpen)
  const startGame = useGame((s) => s.startGame)

  const continuous = config.rideType === 'continuous'
  const mins = Math.floor(options.timerSeconds / 60)
  const secs = options.timerSeconds % 60
  const timerValid = !options.timedMode || options.timerSeconds >= 30
  const valid = timerValid && options.maxGroupSize >= 1 && options.maxGroupSize <= 40 && totalSeats(config) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-black text-ink">Game Options</h2>
        <p className="text-xs text-slate-500">Set the scenario, then hand the device to your trainee.</p>

        <VehicleSection />

        {!continuous && (
          <div className="mt-3 space-y-1 border-t pt-3">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Timer</div>
            <Toggle
              label="Timed Mode"
              hint="Vehicle auto-dispatches when time runs out"
              value={options.timedMode}
              onChange={(v) => setOptions({ timedMode: v })}
            />
            {options.timedMode && (
              <div className="flex items-center gap-3 pb-1 pl-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <select
                    value={mins}
                    onChange={(e) => setOptions({ timerSeconds: Number(e.target.value) * 60 + secs })}
                    className="rounded-lg border border-slate-300 px-2 py-1"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  min
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <select
                    value={secs}
                    onChange={(e) => setOptions({ timerSeconds: mins * 60 + Number(e.target.value) })}
                    className="rounded-lg border border-slate-300 px-2 py-1"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i * 5}>
                        {String(i * 5).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  sec
                </label>
                {!timerValid && (
                  <span className="text-xs font-semibold text-red-500">Minimum 30 seconds</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 space-y-3 border-t pt-3">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Guest Flow</div>
          <label className="block">
            <div className="mb-1 flex justify-between text-sm font-semibold text-ink">
              <span>Number of Visible Guests</span>
              <span>{options.visibleGuests}</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={options.visibleGuests}
              onChange={(e) => setOptions({ visibleGuests: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <div className="flex items-center justify-between">
            <NumInput
              label="Max Guests Per Group"
              value={options.maxGroupSize}
              min={1}
              max={40}
              onChange={(v) => setOptions({ maxGroupSize: v })}
            />
            <span className="text-xs text-slate-500">Larger groups are less likely</span>
          </div>
        </div>

        <div className="mt-3 space-y-1 border-t pt-3">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Gameplay</div>
          <Toggle
            label="Tap to Show Groups"
            hint="Off = all group sizes visible from the start"
            value={options.tapToShow}
            onChange={(v) => setOptions({ tapToShow: v })}
          />
          <Toggle
            label="Single Rider Line"
            hint="Separate line of solo guests to fill leftover seats"
            value={options.singleRider}
            onChange={(v) => setOptions({ singleRider: v })}
          />
          <Toggle
            label="Even/Odd Queues"
            hint="Two lines side by side: even-sized groups and odd-sized groups"
            value={options.evenOdd}
            onChange={(v) => setOptions({ evenOdd: v })}
          />
          <Toggle
            label='"Call for #" Buttons'
            hint="Trainee can request a specific group size"
            value={options.callFor}
            onChange={(v) => setOptions({ callFor: v })}
          />
          <Toggle
            label="Row Requests"
            hint="Guests may ask for a specific row; defer them to the waiting area (3 max)"
            value={options.rowRequests}
            onChange={(v) => setOptions({ rowRequests: v })}
          />
          {!continuous && (
            <Toggle
              label="Double Grouping"
              hint="Stage the next vehicle's guests behind the boarding group"
              value={options.doubleGrouping}
              onChange={(v) => setOptions({ doubleGrouping: v })}
            />
          )}
          <label className="block pt-2">
            <div className="mb-1 flex justify-between text-sm font-semibold text-ink">
              <span>Number of Vehicles to Load</span>
              <span>{options.vehiclesToLoad}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={options.vehiclesToLoad}
              onChange={(e) => setOptions({ vehiclesToLoad: Number(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-slate-500">
              Complete {options.vehiclesToLoad} vehicle{options.vehiclesToLoad === 1 ? '' : 's'} to
              finish the training round
            </div>
          </label>
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => setOptionsOpen(false)}
            className="rounded-full px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={startGame}
            className="rounded-full bg-fantasy px-10 py-2.5 font-black tracking-wide text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            Play
          </button>
        </div>
      </motion.div>
    </div>
  )
}
