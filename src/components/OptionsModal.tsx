import { motion } from 'framer-motion'
import { useGame } from '../store'

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

export function OptionsModal() {
  const options = useGame((s) => s.options)
  const setOptions = useGame((s) => s.setOptions)
  const setOptionsOpen = useGame((s) => s.setOptionsOpen)
  const startGame = useGame((s) => s.startGame)

  const mins = Math.floor(options.timerSeconds / 60)
  const secs = options.timerSeconds % 60
  const timerValid = !options.timedMode || options.timerSeconds >= 30
  const valid = timerValid && options.maxGroupSize >= 1 && options.maxGroupSize <= 40

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-black text-ink">Game Options</h2>
        <p className="text-xs text-slate-500">Set the scenario, then hand the device to your trainee.</p>

        <div className="mt-4 space-y-1 border-t pt-3">
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
              {!timerValid && <span className="text-xs font-semibold text-red-500">Minimum 30 seconds</span>}
            </div>
          )}
        </div>

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
          <label className="block">
            <div className="mb-1 flex justify-between text-sm font-semibold text-ink">
              <span>Max Guests Per Group</span>
            </div>
            <input
              type="number"
              min={1}
              max={40}
              value={options.maxGroupSize}
              onChange={(e) => {
                const v = Math.round(Number(e.target.value))
                setOptions({ maxGroupSize: Math.min(40, Math.max(1, isNaN(v) ? 1 : v)) })
              }}
              className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-ink"
            />
            <div className="mt-1 text-xs text-slate-500">Larger groups are less likely to appear</div>
          </label>
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
            label='"Call for #" Buttons'
            hint="Trainee can request a specific group size"
            value={options.callFor}
            onChange={(v) => setOptions({ callFor: v })}
          />
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
