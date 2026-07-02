import { motion } from 'framer-motion'
import { useGame } from '../store'
import { RIDE_TYPE_INFO, type RideType } from '../types'
import { OptionsModal } from './OptionsModal'

const RIDE_TYPES: RideType[] = ['interval', 'continuous', 'stopgo']

function Slider({
  label,
  icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  icon: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white/90">
        <span>
          {icon} {label}
        </span>
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  )
}

export function Landing() {
  const config = useGame((s) => s.config)
  const setConfig = useGame((s) => s.setConfig)
  const optionsOpen = useGame((s) => s.optionsOpen)
  const setOptionsOpen = useGame((s) => s.setOptionsOpen)

  const seats = config.sections * config.rowsPerSection * config.guestsPerRow
  const valid =
    config.sections >= 1 &&
    config.sections <= 100 &&
    config.rowsPerSection >= 1 &&
    config.guestsPerRow >= 1

  return (
    <div className="min-h-full overflow-y-auto bg-gradient-to-br from-fantasy via-[#3a4bb5] to-magic">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center px-4 py-8 sm:py-12">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-5xl">🎢</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            G.U.R.G.I.
          </h1>
          <p className="text-sm font-semibold text-white/80 sm:text-base">
            Guest Unit Ride Grouper Interface
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-white/60">
            Attraction Host Training System
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 w-full"
        >
          <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white/70">
            Choose your ride type
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RIDE_TYPES.map((rt) => {
              const info = RIDE_TYPE_INFO[rt]
              const active = config.rideType === rt
              return (
                <button
                  key={rt}
                  onClick={() => setConfig({ rideType: rt })}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-white bg-white text-ink shadow-xl'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="text-3xl">{info.icon}</div>
                  <div className="mt-1 font-bold leading-tight">{info.label}</div>
                  <div className={`mt-1 text-xs ${active ? 'text-slate-500' : 'text-white/70'}`}>
                    {info.blurb}
                  </div>
                </button>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 w-full space-y-4 rounded-2xl bg-white/10 p-5 backdrop-blur"
        >
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white/90">
              <span>🚃 Ride Size Sections</span>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-white">{config.sections}</span>
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={config.sections}
              onChange={(e) => {
                const v = Math.round(Number(e.target.value))
                setConfig({ sections: Math.min(100, Math.max(1, isNaN(v) ? 1 : v)) })
              }}
              className="w-full rounded-lg border-0 bg-white/90 px-3 py-2 font-semibold text-ink outline-none focus:ring-2 focus:ring-white"
            />
          </label>
          <Slider
            label="Rows per Section"
            icon="🪑"
            value={config.rowsPerSection}
            min={1}
            max={20}
            onChange={(v) => setConfig({ rowsPerSection: v })}
          />
          <Slider
            label="Guests per Row"
            icon="🧍"
            value={config.guestsPerRow}
            min={1}
            max={20}
            onChange={(v) => setConfig({ guestsPerRow: v })}
          />
          <div className="text-center text-xs font-medium text-white/70">
            Vehicle capacity: <b className="text-white">{seats}</b> guests
            {seats > 400 && ' — large vehicles may run slower on older devices'}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <button
            disabled={!valid}
            onClick={() => setOptionsOpen(true)}
            className="rounded-full bg-white px-14 py-4 text-xl font-black tracking-widest text-fantasy shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            GO
          </button>
        </motion.div>

        <p className="mt-8 text-center text-xs text-white/50">
          Built with ❤️ for Theme Park Attractions Hosts everywhere
        </p>
      </div>

      {optionsOpen && <OptionsModal />}
    </div>
  )
}
