import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useGame } from './store'
import './index.css'

// Dev-only hook for automated smoke tests
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__GURGI__ = useGame
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
