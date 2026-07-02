import { useGame } from './store'
import { Landing } from './components/Landing'
import { GameScreen } from './components/GameScreen'

export default function App() {
  const screen = useGame((s) => s.screen)
  return screen === 'landing' ? <Landing /> : <GameScreen />
}
