import { motion } from 'framer-motion'
import { useGame } from '../store'

function grade(efficiency: number) {
  if (efficiency >= 98) return { letter: 'A+', note: 'Flawless dispatch! Trainer material.' }
  if (efficiency >= 93) return { letter: 'A', note: 'Outstanding grouping efficiency!' }
  if (efficiency >= 85) return { letter: 'B', note: 'Great work — a few seats slipped by.' }
  if (efficiency >= 75) return { letter: 'C', note: 'Solid. Try the Call for # buttons to fill gaps.' }
  if (efficiency >= 60) return { letter: 'D', note: 'Keep practicing — watch those part-empty rows.' }
  return { letter: 'F', note: 'Empty seats everywhere! Slow down and count the party sizes.' }
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`
}

export function CompletionScreen() {
  const stats = useGame((s) => s.stats)
  const startGame = useGame((s) => s.startGame)
  const backToLanding = useGame((s) => s.backToLanding)

  const totalSeats = stats.reduce((a, v) => a + v.seats, 0)
  const totalFilled = stats.reduce((a, v) => a + v.filled, 0)
  const score = totalSeats - totalFilled
  const totalTime = stats.reduce((a, v) => a + v.seconds, 0)
  const avgTime = stats.length > 0 ? totalTime / stats.length : 0
  const efficiency = totalSeats > 0 ? (totalFilled / totalSeats) * 100 : 0
  const g = grade(efficiency)

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <motion.div
          initial={{ rotate: -12, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="text-5xl"
        >
          {score === 0 ? '🏆' : '🎉'}
        </motion.div>
        <h2 className="mt-2 text-2xl font-black text-ink">Training Round Complete!</h2>

        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-fantasy to-magic px-6 py-3 text-white shadow-lg">
            <div className="text-xs font-bold uppercase tracking-widest text-white/70">Score ⛳</div>
            <div className="text-4xl font-black tabular-nums">{score}</div>
            <div className="text-[10px] font-semibold text-white/70">empty seats · lower is better</div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-6 py-3 shadow-inner">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Grade</div>
            <div className="text-4xl font-black text-ink">{g.letter}</div>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-500">{g.note}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          {[
            ['Guests loaded', `${totalFilled}`],
            ['Seats filled', `${efficiency.toFixed(1)}%`],
            ['Total time', fmt(totalTime)],
            ['Avg per vehicle', fmt(avgTime)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-4 py-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
              <div className="text-lg font-extrabold text-ink tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={startGame}
            className="rounded-full bg-fantasy py-3 font-black tracking-wide text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={() => backToLanding(true)}
            className="rounded-full bg-slate-100 py-3 font-bold text-ink hover:bg-slate-200"
          >
            Change Settings
          </button>
          <button
            onClick={() => backToLanding(false)}
            className="rounded-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            Choose Different Ride
          </button>
        </div>
      </motion.div>
    </div>
  )
}
