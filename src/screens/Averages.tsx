import { Info, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import { Finn, type FinnMood } from '../components/Finn'
import { CategoryTile, ScreenHeader, SpeechBubble, cn } from '../components/ui'
import { AVERAGES, CATEGORIES, CATEGORY_BY_ID, SPENT, type CategoryId } from '../data/mock'
import { TOTAL_SPENT, currentMonth, money, type Limits } from '../lib/budget'
import type { Screen } from '../lib/useRoute'
import { useBudget } from '../state/BudgetContext'

const AVG_TOTAL = CATEGORIES.reduce((sum, c) => sum + AVERAGES[c.id], 0)
const SCALE_MAX = Math.max(...CATEGORIES.flatMap((c) => [SPENT[c.id], AVERAGES[c.id]]))

const spring = { type: 'spring', stiffness: 90, damping: 18 } as const

export function Averages({ go }: { go: (s: Screen) => void }) {
  const { limits } = useBudget()
  const totalDiff = TOTAL_SPENT - AVG_TOTAL

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Your averages"
        subtitle={`How ${currentMonth} so far compares with a typical month.`}
        onBack={() => go('dashboard')}
        accessory={
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-ink-soft shadow-card">
            <Info size={13} strokeWidth={2.6} /> Illustrative demo data
          </span>
        }
      />

      <div className="space-y-4 px-5 pt-3">
        {/* Overall: this month vs typical */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] bg-gradient-to-br from-[#FFE3D6] via-peach to-[#FFD2C2] p-5 shadow-card"
        >
          <div className="space-y-3">
            <TotalBar label="This month so far" value={TOTAL_SPENT} max={Math.max(TOTAL_SPENT, AVG_TOTAL)} />
            <TotalBar label="Typical month" value={AVG_TOTAL} max={Math.max(TOTAL_SPENT, AVG_TOTAL)} striped />
          </div>
          <p className="mt-4 text-[14.5px] leading-snug font-bold">
            {totalDiff <= 0
              ? `You're ${money(-totalDiff)} under a typical month so far.`
              : `You're ${money(totalDiff)} above a typical month so far.`}
          </p>
        </motion.section>

        {/* By category */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[30px] bg-white p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[19px] font-semibold">By category</h2>
            <div className="flex items-center gap-3 text-[11.5px] font-bold text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-full bg-gradient-to-r from-pink via-lavender to-peach" /> Now
              </span>
              <span className="flex items-center gap-1.5">
                <span className="stripes h-2.5 w-4 rounded-full bg-[#C9C2C7]" /> Average
              </span>
            </div>
          </div>

          <ul className="mt-4 space-y-5">
            {CATEGORIES.map((c, i) => (
              <CategoryCompare key={c.id} id={c.id} index={i} />
            ))}
          </ul>
          <p className="mt-5 text-[11.5px] font-semibold text-ink/45">
            Averages are mock data from a pretend 6-month history, for this demo only.
          </p>
        </motion.section>

        {/* Insights */}
        <section className="space-y-3">
          {insights(limits).map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              className={cn('flex items-center gap-2 rounded-[26px] p-3 pr-4', ins.bg)}
            >
              <Finn mood={ins.mood} size={62} float={false} className="shrink-0" />
              <SpeechBubble tail="left" className="flex-1">
                {ins.text}
              </SpeechBubble>
            </motion.div>
          ))}
        </section>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => go('dashboard')}
          className="h-14 w-full rounded-[20px] border-2 border-ink bg-white text-[16px] font-extrabold"
        >
          Back to dashboard
        </motion.button>
      </div>
    </div>
  )
}

function TotalBar({ label, value, max, striped }: { label: string; value: number; max: number; striped?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-extrabold text-ink/70">{label}</span>
        <span className="font-display text-[22px] font-semibold">{money(value)}</span>
      </div>
      <div className="h-5 rounded-full bg-white/55 p-[3px]">
        <motion.div
          className={cn('h-full rounded-full', striped ? 'stripes bg-[#E9A88C]' : 'bg-[#E58763]')}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ ...spring, delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function CategoryCompare({ id, index }: { id: CategoryId; index: number }) {
  const cat = CATEGORY_BY_ID[id]
  const now = SPENT[id]
  const avg = AVERAGES[id]
  const diff = now - avg
  const above = diff > 0
  const pct = (v: number) => `${Math.max(3, (v / SCALE_MAX) * 100)}%`

  return (
    <li className="flex items-center gap-3">
      <CategoryTile id={id} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[14.5px] font-extrabold">{cat.name}</span>
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-extrabold',
              above ? 'bg-coral-soft text-coral-deep' : 'bg-mint-soft text-mint-deep',
            )}
          >
            {above ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {above ? '+' : '−'}
            {money(Math.abs(diff))}
          </span>
        </div>
        <div className="mt-2 space-y-1.5">
          <BarRow width={pct(now)} value={now} color={cat.hex} delay={0.15 + index * 0.08} />
          <BarRow width={pct(avg)} value={avg} color="#DDD7DB" striped delay={0.2 + index * 0.08} />
        </div>
      </div>
    </li>
  )
}

function BarRow({
  width,
  value,
  color,
  striped,
  delay,
}: {
  width: string
  value: number
  color: string
  striped?: boolean
  delay: number
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 flex-1">
        <motion.div
          className={cn('h-full rounded-full', striped && 'stripes')}
          style={{ backgroundColor: color, boxShadow: striped ? undefined : 'inset 0 0 0 1.5px rgb(41 39 41 / 0.12)' }}
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ ...spring, delay }}
        />
      </div>
      <span
        className={cn('w-10 shrink-0 text-right text-[12px] font-bold tabular-nums', striped ? 'text-ink/45' : 'text-ink')}
      >
        {money(value)}
      </span>
    </div>
  )
}

/** Two short, friendly insights: the biggest jump above average, and the biggest win below it. */
function insights(limits: Limits): { text: string; mood: FinnMood; bg: string }[] {
  const diffs = CATEGORIES.map((c) => ({ c, diff: SPENT[c.id] - AVERAGES[c.id] }))
  const up = diffs.reduce((a, b) => (b.diff > a.diff ? b : a))
  const down = diffs.reduce((a, b) => (b.diff < a.diff ? b : a))
  const out: { text: string; mood: FinnMood; bg: string }[] = []

  if (up.diff > 0) {
    const limit = limits[up.c.id]
    const spent = SPENT[up.c.id]
    const tail =
      spent <= limit
        ? `Your ${money(limit)} goal still leaves ${money(limit - spent)} of room.`
        : `That's ${money(spent - limit)} past your ${money(limit)} goal — a small tweak could help.`
    out.push({
      mood: spent <= limit ? 'happy' : 'concerned',
      bg: 'bg-pink/60',
      text: `${up.c.name} is ${money(up.diff)} above your usual ${money(AVERAGES[up.c.id])}. ${tail}`,
    })
  }
  if (down.diff < 0) {
    out.push({
      mood: 'happy',
      bg: 'bg-mint/70',
      text: `Only ${money(SPENT[down.c.id])} on ${down.c.phrase} so far — your usual is ${money(
        AVERAGES[down.c.id],
      )}. Nicely done!`,
    })
  }
  return out
}
