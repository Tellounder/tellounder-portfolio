import { Component, StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

declare global {
  interface Window {
    tellounderBoot: {
      entered: boolean
      audio: boolean
      ready: boolean
      timer: number
      fail: () => void
      finish: () => void
    }
  }
}

const boot = window.tellounderBoot
// Fetch code in the background; mount the portfolio only on entry.
const application = Promise.all([import('./App'), import('./styles.css')])
application.then(() => window.clearTimeout(boot.timer)).catch(() => boot.fail())
let mounted = false

class StartupBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { boot.fail() }
  render() { return this.state.failed ? null : this.props.children }
}

function Ready() {
  useEffect(() => {
    boot.ready = true
    boot.finish()
    window.dispatchEvent(new Event('resize'))
    if (document.activeElement === document.getElementById('boot-enter')) {
      document.querySelector<HTMLElement>('.brand')?.focus({ preventScroll: true })
    }
  }, [])
  return null
}

async function mount() {
  if (mounted) return
  mounted = true
  try {
    const [{ default: App }] = await application
    document.documentElement.classList.add('app-mounting')
    createRoot(document.getElementById('app-root')!).render(<StrictMode><StartupBoundary><App initialAudio={boot.audio} /><Ready /></StartupBoundary></StrictMode>)
  } catch {
    boot.fail()
  }
}

if (boot.entered) void mount()
else window.addEventListener('tellounder:enter', () => void mount(), { once: true })
