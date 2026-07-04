import { motion } from 'framer-motion'
import { useGame } from '../store'
import { RIDE_TYPE_INFO, type RideType } from '../types'
import { OptionsModal } from './OptionsModal'

const RIDE_TYPES: RideType[] = ['coaster', 'carousel', 'spinner', 'continuous', 'theater']

export function Landing() {
  const config = useGame((s) => s.config)
  const setRideType = useGame((s) => s.setRideType)
  const optionsOpen = useGame((s) => s.optionsOpen)
  const setOptionsOpen = useGame((s) => s.setOptionsOpen)

  return (
    <div className="min-h-full overflow-y-auto bg-gradient-to-br from-fantasy via-[#3a4bb5] to-magic">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center px-4 py-8 sm:py-12">
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
            Choose your attraction
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RIDE_TYPES.map((rt) => {
              const info = RIDE_TYPE_INFO[rt]
              const active = config.rideType === rt
              return (
                <button
                  key={rt}
                  onClick={() => setRideType(rt)}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          <button
            onClick={() => setOptionsOpen(true)}
            className="rounded-full bg-white px-14 py-4 text-xl font-black tracking-widest text-fantasy shadow-2xl transition-transform hover:scale-105 active:scale-95"
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
