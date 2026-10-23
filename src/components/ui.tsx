import { ArrowLeft } from 'lucide-react'
import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { CATEGORY_BY_ID, type CategoryId } from '../data/mock'
import { money } from '../lib/budget'

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

/** Springs between values; pass `from` to replay a change on mount (e.g. after saving goals). */
export function AnimatedMoney({
  value,
  from,
  delay = 0,
  className,
}: {
  value: number
  from?: number
  delay?: number
  className?: string
}) {
  const mv = useSpring(from ?? value, { stiffness: 70, damping: 16 })
  const text = useTransform(mv, (v) => money(v))

  useEffect(() => {
    if (!delay) {
      mv.set(value)
      return
    }
    const t = setTimeout(() => mv.set(value), delay)
    return () => clearTimeout(t)
  }, [mv, value, delay])

  return <motion.span className={cn('tabular-nums', className)}>{text}</motion.span>
}

export function CategoryTile({ id, size = 44 }: { id: CategoryId; size?: number }) {
  const cat = CATEGORY_BY_ID[id]
  const Icon = cat.icon
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-2xl', cat.tile)}
      style={{ width: size, height: size }}
    >
      <Icon className={cat.iconColor} size={size * 0.48} strokeWidth={2.3} />
    </div>
  )
}

/** Rounded goal progress bar: mint while on track, coral with a limit notch once over. */
export function GoalBar({
  spent,
  limit,
  className,
  height = 10,
}: {
  spent: number
  limit: number
  className?: string
  height?: number
}) {
  const over = spent > limit
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 100
  const notch = over && limit > 0 ? (limit / spent) * 100 : null

  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full bg-[#EFECEA]', className)}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(pct, spent > 0 ? 4 : 0)}%`, backgroundColor: over ? '#F2786A' : '#7CD3AE' }}
        transition={{ type: 'spring', stiffness: 110, damping: 20 }}
      />
      {notch !== null && (
        <motion.span
          className="absolute top-0 h-full w-[3px] rounded-full bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, left: `${notch}%` }}
          transition={{ type: 'spring', stiffness: 110, damping: 20 }}
        />
      )}
    </div>
  )
}

export function StatusChip({ overBy, allowance }: { overBy: number; allowance: number }) {
  const over = overBy > 0
  return (
    <motion.span
      key={over ? 'over' : 'ok'}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-extrabold whitespace-nowrap',
        over ? 'bg-coral-soft text-coral-deep' : 'bg-mint-soft text-mint-deep',
      )}
    >
      {over ? `${money(overBy)} over` : `${money(allowance)} left`}
    </motion.span>
  )
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  accessory,
}: {
  title: string
  subtitle?: string
  onBack: () => void
  accessory?: ReactNode
}) {
  return (
    <header className="px-5 pt-6 pb-2">
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="grid size-11 place-items-center rounded-full bg-white shadow-card"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </motion.button>
        {accessory}
      </div>
      <h1 className="mt-5 font-display text-[32px] leading-none font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-snug text-ink-soft">{subtitle}</p>}
    </header>
  )
}

/** Speech bubble with a small tail; `tail` picks which corner it points from. */
export function SpeechBubble({
  children,
  tail = 'right',
  className,
}: {
  children: ReactNode
  tail?: 'right' | 'top-right' | 'left'
  className?: string
}) {
  return (
    <div className={cn('relative rounded-[20px] bg-white px-4 py-3 text-[14px] leading-snug font-semibold', className)}>
      {children}
      <span
        className={cn(
          'absolute size-3.5 rotate-45 bg-white',
          tail === 'right' && 'top-1/2 -right-1.5 -translate-y-1/2',
          tail === 'left' && 'top-1/2 -left-1.5 -translate-y-1/2',
          tail === 'top-right' && '-top-1.5 right-10',
        )}
      />
    </div>
  )
}
