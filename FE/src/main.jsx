import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const CHUNK_RELOAD_KEY = 'chunk-reload-attempted'

window.addEventListener('unhandledrejection', (event) => {
  const reasonMessage =
    typeof event.reason === 'string' ? event.reason : event.reason?.message || ''

  if (!reasonMessage.includes('Failed to fetch dynamically imported module')) {
    return
  }

  // Old open tabs can reference stale hashed chunks after a new deploy.
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) !== '1') {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    window.location.reload()
    return
  }

  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
})

window.addEventListener('load', () => {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
})

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}
