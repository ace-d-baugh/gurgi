import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGame } from '../store'
import { RIDE_TYPE_INFO } from '../types'
import { GameScene } from '../three/GameScene'
import { CompletionScreen } from './CompletionScreen'

function useCountdown() {
  const deadline = useGame((s) => s.timerDeadline)
  const [remain, setRemain] = useState<number | null>(null)
  useEffect(() => {
    if (!deadline) {
      setRemain(null)
      return
    }
    const tick = () => {
      const r = Math.max(0, (deadline - Date.now()) / 1000)
      setRemain(r)
      if (r <= 0) useGame.getState().sendVehicle(true)
    }
    tick()
    const iv = setInterval(tick, 200)
    return () => clearInterval(iv)
  }, [deadline])
  return remain
}

function TimerDisplay() {
  const remain = useCountdown()
  const total = useGame((s) => s.options.timerSeconds)
  if (remain === null) return null
  const frac = remain / total
  const color = frac <= 0.1 ? 'text-red-500' : frac <= 0.2 ? 'text-yellow-500' : 'text-ink'
  const mm = String(Math.floor(remain / 60)).padStart(2, '0')
  const ss = String(Math.floor(remain % 60)).padStart(2, '0')
  return (
    <div className={`rounded-xl bg-white/90 px-3 py-1 font-mono text-xl font-black tabular-nums shadow ${color}`}>
      ⏱ {mm}:{ss}
    </div>
  )
}

function Toast() {
  const toast = useGame((s) => s.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2400)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <AnimatePresence>
      {toast && visible && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-ink/90 px-5 py-2 text-sm font-bold text-white shadow-xl"
        >
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black text-ink">How to Play 🎢</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            <b>Tap a gray group</b> in the queue — the whole party lights up in one color and shows
            its size badge.
          </li>
          <li>
            <b>Tap guests</b> to select them (white ring). You can only select from one party at a
            time, up to the row capacity.
          </li>
          <li>
            <b>Tap a load row</b> (the circles, or the vehicle row itself) to walk them over. Too
            many for the row? It flashes red.
          </li>
          <li>
            Use <b>Call for #</b> to pull a party of an exact size to the front — great for filling
            odd seats. <b>Single riders</b> (black, side line) plug single gaps.
          </li>
          <li>
            Hit <b>Send It!</b> to dispatch. In timed mode the vehicle leaves when the clock hits
            zero, ready or not!
          </li>
        </ol>
        <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
          ⛳ <b>Scoring is like golf:</b> your score is the number of <b>empty seats</b> you
          dispatch. A perfect round is <b>0</b>. Fill every seat!
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-fantasy py-2.5 font-black text-white"
        >
          Got it!
        </button>
      </motion.div>
    </div>
  )
}

export function GameScreen() {
  const screen = useGame((s) => s.screen)
  const config = useGame((s) => s.config)
  const options = useGame((s) => s.options)
  const phase = useGame((s) => s.phase)
  const vehicleNumber = useGame((s) => s.vehicleNumber)
  const stats = useGame((s) => s.stats)
  const guests = useGame((s) => s.guests)
  const selection = useGame((s) => s.selection)
  const sendVehicle = useGame((s) => s.sendVehicle)
  const callFor = useGame((s) => s.callFor)
  const backToLanding = useGame((s) => s.backToLanding)
  const [helpOpen, setHelpOpen] = useState(false)

  const info = RIDE_TYPE_INFO[config.rideType]
  const emptySoFar = stats.reduce((acc, v) => acc + (v.seats - v.filled), 0)
  const anyLoaded = Object.values(guests).some((g) => g.state === 'loaded' || g.state === 'seated')
  const callSizes = Array.from({ length: Math.min(9, options.maxGroupSize) }, (_, i) => i + 1)

  const phaseLabel =
    phase === 'dispatching'
      ? '🚀 Dispatching…'
      : phase === 'arriving'
        ? config.rideType === 'stopgo'
          ? '🎢 Ride running… vehicle returning'
          : '🛬 Vehicle arriving…'
        : null

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#bfe0f5]">
      <GameScene />

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 shadow">
          <span className="text-xl">{info.icon}</span>
          <span className="hidden text-sm font-bold text-ink sm:inline">{info.label}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <TimerDisplay />
          <button
            onClick={() => sendVehicle(false)}
            disabled={phase !== 'loading' || !anyLoaded}
            className="rounded-xl bg-magic px-4 py-1.5 text-base font-black tracking-wide text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            Send It! 🚀
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="How to play"
            className="rounded-xl bg-white/90 px-3 py-1.5 text-base font-black text-ink shadow"
          >
            ?
          </button>
          <button
            onClick={() => backToLanding(true)}
            aria-label="Settings"
            className="rounded-xl bg-white/90 px-3 py-1.5 text-base shadow"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Phase banner */}
      <AnimatePresence>
        {phaseLabel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/80 px-6 py-2 text-base font-bold text-white shadow-xl"
          >
            {phaseLabel}
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />

      {/* Bottom bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3">
        {options.callFor ? (
          <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1.5 shadow">
            <span className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Call for
            </span>
            {callSizes.map((n) => (
              <button
                key={n}
                onClick={() => callFor(n)}
                disabled={phase !== 'loading'}
                className="h-8 w-8 rounded-lg bg-fantasy text-sm font-black text-white transition-transform hover:scale-110 active:scale-90 disabled:opacity-40"
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div className="pointer-events-auto flex items-center gap-2">
          {selection.length > 0 && (
            <span className="rounded-xl bg-white/90 px-3 py-1.5 text-sm font-bold text-ink shadow">
              ✔ {selection.length} selected
            </span>
          )}
          <span className="rounded-xl bg-white/90 px-3 py-1.5 text-sm font-bold text-ink shadow">
            ⛳ {emptySoFar}
          </span>
          <span className="rounded-xl bg-white/90 px-3 py-1.5 text-sm font-bold text-ink shadow">
            Vehicle {Math.min(vehicleNumber, options.vehiclesToLoad)} of {options.vehiclesToLoad}
          </span>
        </div>
      </div>

      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
      {screen === 'complete' && <CompletionScreen />}
    </div>
  )
}
