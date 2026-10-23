import { ChartColumn, Check, Pencil, Sparkles, Star, Wallet } from 'lucide-react'
import { motion, useInView, type Variants } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Finn, type FinnMood } from '../components/Finn'
import { CoinStack } from '../components/Illustrations'
import { AnimatedMoney, CategoryTile, GoalBar, SpeechBubble, StatusChip, cn } from '../components/ui'
import { CATEGORIES, CATEGORY_BY_ID, MONTHLY_BUDGET, SPENT, type CategoryId } from '../data/mock'
import { OVERALL_REMAINING, TOTAL_SPENT, allStatuses, currentMonth, money, type CategoryStatus } from '../lib/budget'
import type { Screen } from '../lib/useRoute'
import { useBudget } from '../state/BudgetContext'

const BREAKDOWN: CategoryId[] = ['shopping', 'entertainment', 'food']

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
}

export function Dashboard({ go }: { go: (s: Screen) => void }) {
  const { limits, safe, celebration, clearCelebration } = useBudget()
  const statuses = allStatuses(limits)
  const byId = Object.fromEntries(statuses.map((s) => [s.id, s])) as Record<CategoryId, CategoryStatus>
  const over = statuses.filter((s) => s.isOver)
  const justSaved = celebration !== null

  const goalsRef = useRef<HTMLElement>(null)
  const safeRef = useRef<HTMLElement>(null)
  const safeInView = useInView(safeRef, { once: true, amount: 0.6 })

  // After saving, glide down so the updated goals and safe-to-spend are in view.
  useEffect(() => {
    if (!celebration) return
    const t = setTimeout(() => goalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
    return () => clearTimeout(t)
  }, [celebration])

  // Let the "goals saved" moment play once it's been seen, then settle back to normal.
  useEffect(() => {
    if (!celebration || !safeInView) return
    const t = setTimeout(clearCelebration, 6000)
    return () => clearTimeout(t)
  }, [celebration, safeInView, clearCelebration])

  const leave = (s: Screen) => {
    clearCelebration()
    go(s)
  }

  const { mood, message } = finnSays(over, safe, justSaved)

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="px-5 pt-6 pb-10">
      {/* Logo */}
      <motion.header variants={rise} className="flex items-center justify-center gap-2">
        <Finn size={34} float={false} />
        <span className="font-display text-[26px] font-semibold tracking-tight">
          Fin<span className="text-[#B4497A]">Friend</span>
        </span>
      </motion.header>

      {/* Monthly spending hero */}
      <motion.section
        variants={rise}
        className="relative z-10 mt-5 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E9DDFD] via-lavender to-[#F3C9E3] p-5 shadow-card"
      >
        <span className="absolute -top-10 -right-8 size-36 rounded-full bg-white/25" />
        <CoinStack className="absolute top-4 right-3 w-[92px]" />
        <p className="relative text-[13px] font-extrabold tracking-[0.12em] text-[#6D4FC2] uppercase">
          {currentMonth} spending
        </p>
        <p className="relative mt-1.5 font-display leading-none font-semibold">
          <span className="text-[54px] tracking-tight">${TOTAL_SPENT}</span>
          <span className="align-super text-[22px] underline decoration-2 underline-offset-4">.00</span>
        </p>
        <p className="relative mt-1 text-[17px] font-bold">spent this month</p>

        <div className="relative mt-5">
          <div className="mb-1.5 flex justify-between text-[12px] font-bold text-ink/55">
            <span>{Math.round((TOTAL_SPENT / MONTHLY_BUDGET) * 100)}% used</span>
            <span>{money(MONTHLY_BUDGET)} monthly budget</span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-white/60">
            <motion.div
              className="h-full rounded-full bg-[#9B7BE8]"
              initial={{ width: 0 }}
              animate={{ width: `${(TOTAL_SPENT / MONTHLY_BUDGET) * 100}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 }}
            />
          </div>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3.5 py-1.5 text-[14.5px] font-bold whitespace-nowrap">
            — <b className="font-extrabold">{money(OVERALL_REMAINING)}</b> remaining in {currentMonth} —
          </p>
        </div>
      </motion.section>

      {/* Breakdown, branching off the hero like the sketch */}
      <motion.ul variants={list}>
        {BREAKDOWN.map((id) => (
          <TreeItem key={id}>
            <BreakdownCard status={byId[id]} />
          </TreeItem>
        ))}
        <TreeItem last>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-line px-3.5 py-2 text-[13px] font-semibold text-ink-soft">
            <CategoryTile id="other" size={24} />
            <span>
              Plus <b className="text-ink/80">{money(SPENT.other)}</b> in other spending
            </span>
          </div>
        </TreeItem>
      </motion.ul>

      {/* Spending goals */}
      <motion.section ref={goalsRef} variants={rise} className="mt-8 scroll-mt-4">
        <h2 className="flex items-center gap-2 font-display text-[21px] font-semibold tracking-tight">
          <Star className="fill-butter text-[#E6C23A]" size={24} strokeWidth={2.2} />
          Your spending goals
        </h2>
        <div className="mt-3 space-y-2.5">
          {over.map((s) => (
            <GoalPill key={s.id} tone="over">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[15px] font-black text-coral">
                !
              </span>
              <span>
                <b>{money(s.overBy)}</b> over {CATEGORY_BY_ID[s.id].phrase} limit
              </span>
            </GoalPill>
          ))}
          <GoalPill tone="ok">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-mint-deep">
              {over.length ? <Check size={16} strokeWidth={3} /> : <Sparkles size={15} strokeWidth={2.5} />}
            </span>
            <span>{over.length ? 'Under all other limits!' : 'Under all your limits!'}</span>
          </GoalPill>
        </div>
      </motion.section>

      {/* Actions */}
      <motion.div variants={rise} className="mt-5 grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          onClick={() => leave('edit')}
          className="relative flex h-14 items-center justify-center gap-2 rounded-[20px] bg-ink text-[16px] font-extrabold text-white shadow-lift"
        >
          <Pencil size={18} strokeWidth={2.5} />
          Edit goals
          {over.length > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60" />
              <span className="relative inline-flex size-4 rounded-full border-2 border-cream bg-coral" />
            </span>
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          onClick={() => leave('averages')}
          className="flex h-14 items-center justify-center gap-2 rounded-[20px] border-2 border-ink bg-white text-[16px] font-extrabold"
        >
          See averages
          <ChartColumn size={18} strokeWidth={2.5} />
        </motion.button>
      </motion.div>

      {/* Safe to spend */}
      <motion.section
        ref={safeRef}
        variants={rise}
        className="relative mt-5 rounded-[32px] bg-gradient-to-br from-[#D3F2E2] via-mint to-[#C9EBDD] p-5 shadow-card"
      >
        {justSaved && safeInView && <SavedSparkle />}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-[0.12em] text-mint-deep uppercase">
              <Wallet size={15} strokeWidth={2.6} /> Safe to spend
            </p>
            <p className="mt-1 font-display text-[48px] leading-none font-semibold tracking-tight">
              <AnimatedMoney
                value={celebration && !safeInView ? celebration.fromSafe : safe}
                from={celebration?.fromSafe}
                delay={celebration ? 350 : 0}
              />
            </p>
            <p className="mt-1.5 text-[14px] leading-snug font-semibold text-ink/70">
              left inside your category goals
            </p>
          </div>
          <Finn mood={mood} size={92} className="-mt-1 -mr-1 shrink-0" />
        </div>

        <SpeechBubble tail="top-right" className="mt-3 shadow-[0_6px_16px_-10px_rgba(41,39,41,0.3)]">
          <motion.span key={message} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="block">
            {message}
          </motion.span>
        </SpeechBubble>

        <SafeBreakdown statuses={statuses} safe={safe} />

        <p className="mt-4 rounded-2xl bg-white/50 px-3.5 py-2.5 text-[12.5px] leading-snug font-semibold text-ink/70">
          Your overall budget still has <b className="text-ink">{money(OVERALL_REMAINING)}</b> left. Safe to spend
          only counts the room left in each goal — over-goal categories count as $0.
        </p>
      </motion.section>
    </motion.div>
  )
}

function finnSays(over: CategoryStatus[], safe: number, justSaved: boolean): { mood: FinnMood; message: string } {
  if (justSaved && over.length === 0)
    return { mood: 'celebrate', message: `Yay, goals saved! Everything's on track — ${money(safe)} is yours to spend safely.` }
  if (justSaved) return { mood: 'happy', message: 'Goals saved! A small step is still a step — you’ve got this.' }
  if (over.length === 1) {
    const s = over[0]
    return {
      mood: 'concerned',
      message: `${CATEGORY_BY_ID[s.id].name} went ${money(s.overBy)} past its goal. No biggie — want to adjust it?`,
    }
  }
  if (over.length > 1) return { mood: 'concerned', message: 'A couple of goals ran over. Let’s look at them together!' }
  return { mood: 'happy', message: `Every goal is on track. You can spend ${money(safe)} without breaking any.` }
}

function TreeItem({ children, last = false }: { children: ReactNode; last?: boolean }) {
  return (
    <motion.li variants={rise} className="relative pt-3 pl-8">
      {/* elbow from the trunk into this card */}
      <span className="absolute -top-3.5 left-3 h-[calc(50%+20px)] w-5 rounded-bl-[14px] border-b-[3px] border-l-[3px] border-[#DCD4DE]" />
      {!last && <span className="absolute top-1/2 bottom-0 left-3 border-l-[3px] border-[#DCD4DE]" />}
      {children}
    </motion.li>
  )
}

function BreakdownCard({ status }: { status: CategoryStatus }) {
  const cat = CATEGORY_BY_ID[status.id]
  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-3 rounded-[22px] border-2 bg-white p-3 shadow-card transition-colors duration-500',
        status.isOver ? 'border-coral' : 'border-mint',
      )}
    >
      <CategoryTile id={status.id} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-tight">
          <span className="font-display text-[19px] font-semibold">{money(status.spent)}</span>{' '}
          <span className="font-semibold text-ink/75">spent on {cat.phrase}</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          <GoalBar spent={status.spent} limit={status.limit} height={7} />
          <span className="shrink-0 text-[11.5px] font-bold text-ink-soft">of {money(status.limit)}</span>
          <StatusChip overBy={status.overBy} allowance={status.allowance} />
        </div>
      </div>
    </motion.div>
  )
}

function GoalPill({ tone, children }: { tone: 'over' | 'ok'; children: ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-3 rounded-full border-2 py-2 pr-4 pl-2 text-[15.5px] font-bold',
        tone === 'over' ? 'border-coral bg-coral-soft text-coral-deep' : 'border-[#8FD8B6] bg-mint-soft text-mint-deep',
      )}
    >
      {children}
    </motion.div>
  )
}

function SafeBreakdown({ statuses, safe }: { statuses: CategoryStatus[]; safe: number }) {
  return (
    <div className="mt-4">
      <div className="flex h-4 gap-1 overflow-hidden rounded-full bg-white/60 p-[3px]">
        {statuses
          .filter((s) => s.allowance > 0)
          .map((s) => (
            <motion.span
              key={s.id}
              className="h-full rounded-full"
              style={{ backgroundColor: CATEGORY_BY_ID[s.id].hex }}
              initial={{ flexGrow: 0 }}
              animate={{ flexGrow: s.allowance / Math.max(safe, 1) }}
              transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.4 }}
            />
          ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {CATEGORIES.map((c) => {
          const s = statuses.find((x) => x.id === c.id)!
          return (
            <li key={c.id} className="flex items-center gap-2 text-[12.5px] font-bold">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.hex }} />
              <span className="truncate text-ink/70">{c.id === 'food' ? 'Food & bev.' : c.name}</span>
              <span className={cn('ml-auto tabular-nums', s.isOver ? 'text-coral-deep' : 'text-ink')}>
                {s.isOver ? '$0 · over' : money(s.allowance)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SavedSparkle() {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-[32px] ring-4 ring-[#7CD3AE]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.6, delay: 0.3 }}
    />
  )
}
