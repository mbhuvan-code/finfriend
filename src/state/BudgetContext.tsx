import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LIMITS, type CategoryId } from '../data/mock'
import { safeToSpend, type Limits } from '../lib/budget'

const STORAGE_KEY = 'finfriend.goals.v1'

function loadLimits(): Limits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LIMITS
    const parsed = JSON.parse(raw) as Partial<Record<CategoryId, unknown>>
    const next = { ...DEFAULT_LIMITS }
    for (const id of Object.keys(DEFAULT_LIMITS) as CategoryId[]) {
      const v = parsed[id]
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) next[id] = v
    }
    return next
  } catch {
    return DEFAULT_LIMITS
  }
}

/** Set right after saving so the dashboard can replay the change (e.g. $408 → $438). */
export interface Celebration {
  fromSafe: number
  toSafe: number
}

interface BudgetContextValue {
  limits: Limits
  safe: number
  saveLimits: (next: Limits) => void
  celebration: Celebration | null
  clearCelebration: () => void
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [limits, setLimits] = useState<Limits>(loadLimits)
  const [celebration, setCelebration] = useState<Celebration | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limits))
    } catch {
      // Storage unavailable (private mode etc.) — the prototype still works in memory.
    }
  }, [limits])

  const safe = safeToSpend(limits)

  const saveLimits = useCallback(
    (next: Limits) => {
      setCelebration({ fromSafe: safeToSpend(limits), toSafe: safeToSpend(next) })
      setLimits(next)
    },
    [limits],
  )

  const clearCelebration = useCallback(() => setCelebration(null), [])

  const value = useMemo(
    () => ({ limits, safe, saveLimits, celebration, clearCelebration }),
    [limits, safe, saveLimits, celebration, clearCelebration],
  )

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider')
  return ctx
}
