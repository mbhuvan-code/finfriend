import { useCallback, useEffect, useState } from 'react'

export type Screen = 'dashboard' | 'edit' | 'averages'

function parse(): Screen {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h === 'edit' || h === 'averages' ? h : 'dashboard'
}

/** Tiny hash router so the browser back button works between the three screens. */
export function useRoute(): [Screen, (s: Screen) => void] {
  const [screen, setScreen] = useState<Screen>(parse)

  useEffect(() => {
    const onChange = () => setScreen(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((s: Screen) => {
    setScreen(s)
    try {
      window.location.hash = s === 'dashboard' ? '/' : `/${s}`
    } catch {
      // Sandboxed frames may refuse hash changes; in-memory navigation still works.
    }
  }, [])

  return [screen, go]
}
