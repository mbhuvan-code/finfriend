import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useRoute, type Screen } from './lib/useRoute'
import { Averages } from './screens/Averages'
import { Dashboard } from './screens/Dashboard'
import { EditGoals } from './screens/EditGoals'
import { BudgetProvider } from './state/BudgetContext'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BudgetProvider>
        <PhoneFrame>
          <Screens />
        </PhoneFrame>
      </BudgetProvider>
    </MotionConfig>
  )
}

function Screens() {
  const [screen, go] = useRoute()
  const scroller = useRef<HTMLDivElement>(null)
  // Sub-screens slide in from the right; returning to the dashboard slides it back from the left.
  const dir = screen === 'dashboard' ? -1 : 1

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [screen])

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={dir}>
      <motion.div
        key={screen}
        ref={scroller}
        custom={dir}
        variants={{
          enter: (d: number) => ({ x: d * 60, opacity: 0 }),
          center: { x: 0, opacity: 1 },
          exit: (d: number) => ({ x: d * -60, opacity: 0 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain"
      >
        {renderScreen(screen, go)}
      </motion.div>
    </AnimatePresence>
  )
}

function renderScreen(screen: Screen, go: (s: Screen) => void) {
  if (screen === 'edit') return <EditGoals go={go} />
  if (screen === 'averages') return <Averages go={go} />
  return <Dashboard go={go} />
}

/** Full-bleed on phones; a centered device frame on larger screens. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden md:py-8">
      {/* soft pastel backdrop, desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        <div className="absolute -top-24 -left-24 size-[420px] rounded-full bg-lavender/60 blur-3xl" />
        <div className="absolute top-1/3 -right-20 size-[380px] rounded-full bg-pink/50 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 size-[400px] rounded-full bg-mint/60 blur-3xl" />
        <div className="absolute bottom-10 -left-10 size-[220px] rounded-full bg-butter/50 blur-3xl" />
      </div>

      <div
        id="phone-screen"
        className="relative h-full w-full overflow-hidden bg-cream md:h-[min(844px,100%)] md:w-[390px] md:rounded-[52px] md:shadow-[0_40px_80px_-30px_rgba(41,39,41,0.35),0_0_0_10px_#fff,0_0_0_11px_rgba(41,39,41,0.06)]">
        {children}
      </div>
    </div>
  )
}
