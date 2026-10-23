import { Minus, Plus, RotateCcw, Star } from 'lucide-react'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Finn } from '../components/Finn'
import { Confetti } from '../components/Illustrations'
import { AnimatedMoney, CategoryTile, GoalBar, ScreenHeader, StatusChip, cn } from '../components/ui'
import { CATEGORIES, DEFAULT_LIMITS, type Category, type CategoryId } from '../data/mock'
import { categoryStatus, money, safeToSpend, type Limits } from '../lib/budget'
import type { Screen } from '../lib/useRoute'
import { useBudget } from '../state/BudgetContext'

const STEP = 10
const MAX_LIMIT = 9990

export function EditGoals({ go }: { go: (s: Screen) => void }) {
  const { limits, safe, saveLimits } = useBudget()
  const [draft, setDraft] = useState<Limits>(limits)
  const [saved, setSaved] = useState(false)

  const draftSafe = safeToSpend(draft)
  const delta = draftSafe - safe
  const dirty = CATEGORIES.some((c) => draft[c.id] !== limits[c.id])
  const isDefault = CATEGORIES.every((c) => draft[c.id] === DEFAULT_LIMITS[c.id])

  const setLimit = (id: CategoryId, value: number) =>
    setDraft((d) => ({ ...d, [id]: Math.min(MAX_LIMIT, Math.max(0, Math.round(value))) }))

  const save = () => {
    if (!dirty || saved) return
    saveLimits(draft)
    setSaved(true)
  }

  // After the little celebration, head back to the dashboard where the change replays.
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => go('dashboard'), 1900)
    return () => clearTimeout(t)
  }, [saved, go])

  return (
    <div className="relative flex min-h-full flex-col">
      <ScreenHeader
        title="Edit goals"
        subtitle="Set a monthly limit for each category. Finn will keep an eye on the rest."
        onBack={() => go('dashboard')}
        accessory={
          <span className="flex items-center gap-1.5 rounded-full bg-butter px-3 py-1.5 text-[13px] font-extrabold">
            <Star size={14} className="fill-[#E6C23A] text-[#E6C23A]" /> Spending goals
          </span>
        }
      />

      <motion.ul
        className="flex-1 space-y-3 px-5 pt-3 pb-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {CATEGORIES.map((cat) => (
          <GoalEditor
            key={cat.id}
            cat={cat}
            limit={draft[cat.id]}
            original={limits[cat.id]}
            onChange={(v) => setLimit(cat.id, v)}
          />
        ))}

        <AnimatePresence>
          {!isDefault && (
            <motion.li
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center overflow-hidden"
            >
              <button
                onClick={() => setDraft(DEFAULT_LIMITS)}
                className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-ink-soft hover:bg-white"
              >
                <RotateCcw size={14} strokeWidth={2.5} /> Reset to starting goals
              </button>
            </motion.li>
          )}
        </AnimatePresence>
      </motion.ul>

      {/* Sticky save bar with a live safe-to-spend preview */}
      <div className="sticky bottom-0 z-10 px-4 pt-2 pb-5">
        <div className="rounded-[28px] bg-white/85 p-3 shadow-[0_-8px_30px_-12px_rgba(41,39,41,0.25)] backdrop-blur-md">
          <div className="flex items-center justify-between px-2 pb-3">
            <div>
              <p className="text-[12px] font-extrabold tracking-[0.1em] text-mint-deep uppercase">Safe to spend</p>
              <div className="flex items-baseline gap-2">
                <AnimatedMoney value={draftSafe} className="font-display text-[28px] leading-tight font-semibold" />
                <AnimatePresence mode="popLayout">
                  {delta !== 0 && (
                    <motion.span
                      key={delta}
                      initial={{ opacity: 0, y: 6, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[12.5px] font-extrabold',
                        delta > 0 ? 'bg-mint-soft text-mint-deep' : 'bg-coral-soft text-coral-deep',
                      )}
                    >
                      {delta > 0 ? '+' : '−'}
                      {money(Math.abs(delta))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="max-w-[130px] text-right text-[12px] leading-snug font-semibold text-ink-soft">
              {dirty ? `was ${money(safe)} before your changes` : 'Adjust a limit to see it change'}
            </p>
          </div>
          <motion.button
            whileTap={dirty ? { scale: 0.96 } : undefined}
            onClick={save}
            disabled={!dirty}
            className={cn(
              'h-14 w-full rounded-[20px] text-[17px] font-extrabold transition-colors',
              dirty ? 'bg-ink text-white shadow-lift' : 'bg-[#EFECEA] text-ink/35',
            )}
          >
            Save goals
          </motion.button>
        </div>
      </div>

      {/* Portaled to the phone frame so it stays centered no matter how far the list is scrolled. */}
      {createPortal(
        <AnimatePresence>{saved && <SavedOverlay safe={draftSafe} onDone={() => go('dashboard')} />}</AnimatePresence>,
        document.getElementById('phone-screen') ?? document.body,
      )}
    </div>
  )
}

function GoalEditor({
  cat,
  limit,
  original,
  onChange,
}: {
  cat: Category
  limit: number
  original: number
  onChange: (v: number) => void
}) {
  const s = categoryStatus(cat.id, { ...DEFAULT_LIMITS, [cat.id]: limit })
  const changed = limit !== original
  const [text, setText] = useState(String(limit))
  const [focused, setFocused] = useState(false)
  const shown = focused ? text : String(limit)

  // Give the number a little pop when the steppers change it (not while typing).
  const [scope, animate] = useAnimate<HTMLInputElement>()
  const typing = useRef(false)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!typing.current) animate(scope.current, { scale: [1.2, 1] }, { type: 'spring', stiffness: 500, damping: 18 })
  }, [limit, animate, scope])

  return (
    <motion.li
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      className={cn(
        'rounded-[26px] border-2 bg-white p-4 shadow-card transition-colors duration-500',
        s.isOver ? 'border-coral' : 'border-mint',
      )}
    >
      <div className="flex items-center gap-3">
        <CategoryTile id={cat.id} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[18px] leading-tight font-semibold">{cat.name}</p>
          <p className="text-[13px] font-semibold text-ink-soft">{money(s.spent)} spent so far</p>
        </div>
        <StatusChip overBy={s.overBy} allowance={s.allowance} />
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <GoalBar spent={s.spent} limit={limit} height={10} />
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-extrabold tracking-[0.08em] text-ink-soft uppercase">Monthly limit</p>
          <AnimatePresence>
            {changed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[12px] font-bold text-ink/40 line-through"
              >
                was {money(original)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-cream p-1.5">
          <StepButton label={`Decrease ${cat.name} limit`} onClick={() => onChange(limit - STEP)} disabled={limit <= 0}>
            <Minus size={18} strokeWidth={3} />
          </StepButton>
          <label className="flex w-[84px] items-center justify-center font-display text-[22px] font-semibold">
            <span className="text-ink/50">$</span>
            <input
              ref={scope}
              aria-label={`${cat.name} monthly limit`}
              inputMode="numeric"
              value={shown}
              onFocus={(e) => {
                setText(String(limit))
                setFocused(true)
                typing.current = true
                e.currentTarget.select()
              }}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                setText(digits)
                if (digits) onChange(Number(digits))
              }}
              onBlur={() => {
                setFocused(false)
                typing.current = false
                if (!text) onChange(0)
              }}
              className="w-[60px] bg-transparent text-center tabular-nums outline-none"
            />
          </label>
          <StepButton label={`Increase ${cat.name} limit`} onClick={() => onChange(limit + STEP)} disabled={limit >= MAX_LIMIT}>
            <Plus size={18} strokeWidth={3} />
          </StepButton>
        </div>
      </div>
    </motion.li>
  )
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-white shadow-card disabled:opacity-40"
    >
      {children}
    </motion.button>
  )
}

function SavedOverlay({ safe, onDone }: { safe: number; onDone: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 grid place-items-center bg-cream/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDone}
    >
      <motion.div
        className="relative flex flex-col items-center px-8 text-center"
        initial={{ scale: 0.6, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
      >
        <Confetti />
        <Finn mood="celebrate" size={140} />
        <p className="mt-4 font-display text-[30px] leading-none font-semibold">Goals saved!</p>
        <p className="mt-2 text-[15px] font-semibold text-ink-soft">
          You now have <b className="text-mint-deep">{money(safe)}</b> safe to spend.
        </p>
      </motion.div>
    </motion.div>
  )
}
