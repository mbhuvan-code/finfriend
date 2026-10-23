import { motion } from 'motion/react'
import { useMemo } from 'react'

/** A little stack of butter-yellow coins with sparkles, for the spending hero card. */
export function CoinStack({ className }: { className?: string }) {
  const coin = (y: number, key: number) => (
    <g key={key} transform={`translate(0 ${y})`}>
      <ellipse cx={46} cy={12} rx={30} ry={10} fill="#E9C94A" />
      <rect x={16} y={4} width={60} height={8} fill="#E9C94A" />
      <ellipse cx={46} cy={4} rx={30} ry={10} fill="#F8E78C" />
      <ellipse cx={46} cy={4} rx={22} ry={6.5} fill="none" stroke="#E9C94A" strokeWidth={2} />
    </g>
  )

  return (
    <svg viewBox="0 0 100 92" className={className} aria-hidden overflow="visible">
      <ellipse cx={48} cy={86} rx={36} ry={5} fill="#292729" opacity={0.08} />
      {[70, 58, 46, 34].map((y, i) => coin(y, i))}
      <motion.g
        initial={{ y: -14, rotate: -18, opacity: 0 }}
        animate={{ y: 0, rotate: -12, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.35 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <g transform="translate(46 14)">
          <circle r={17} fill="#F5D24A" />
          <circle r={12.5} fill="#F8E78C" />
          <text
            y={6}
            textAnchor="middle"
            fontFamily="Fredoka Variable, sans-serif"
            fontWeight={700}
            fontSize={17}
            fill="#B58F12"
          >
            $
          </text>
        </g>
      </motion.g>
      {[
        { x: 88, y: 26, s: 1, d: 0 },
        { x: 10, y: 40, s: 0.7, d: 0.6 },
        { x: 82, y: 58, s: 0.55, d: 1.1 },
      ].map((st, i) => (
        <g key={i} transform={`translate(${st.x} ${st.y}) scale(${st.s})`}>
          <motion.path
            d="M0 -8 C1.2 -2.4 2.4 -1.2 8 0 C2.4 1.2 1.2 2.4 0 8 C-1.2 2.4 -2.4 1.2 -8 0 C-2.4 -1.2 -1.2 -2.4 0 -8 Z"
            fill="#FFFFFF"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: st.d }}
          />
        </g>
      ))}
    </svg>
  )
}

/** Deterministic 0–1 noise so confetti stays stable across renders. */
const noise = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const CONFETTI_COLORS = ['#F8BFD8', '#B8E6D0', '#DCCBFA', '#F8E78C', '#FFC6AD', '#F2786A', '#7CD3AE']

/** A one-shot radial confetti pop. */
export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (noise(i, 1) - 0.5) * 0.4
        const dist = 90 + noise(i, 2) * 70
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 20,
          rotate: noise(i, 3) * 360,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          round: i % 3 === 0,
          delay: noise(i, 4) * 0.08,
        }
      }),
    [count],
  )

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{
            width: p.round ? 9 : 7,
            height: p.round ? 9 : 13,
            borderRadius: p.round ? 999 : 3,
            backgroundColor: p.color,
            marginLeft: -4,
            marginTop: -4,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 60], opacity: [1, 1, 0], scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.3, 1], delay: p.delay }}
        />
      ))}
    </div>
  )
}
