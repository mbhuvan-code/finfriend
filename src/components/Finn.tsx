import { motion } from 'motion/react'

export type FinnMood = 'happy' | 'concerned' | 'celebrate'

const INK = '#292729'
const fill = { transformBox: 'fill-box', transformOrigin: 'center' } as const

/**
 * Finn — FinFriend's mascot: a chubby little pastel fish.
 * Front-facing with a lavender crest, side fins that wave, and a tail peeking out.
 */
export function Finn({
  mood = 'happy',
  size = 96,
  float = true,
  className,
}: {
  mood?: FinnMood
  size?: number
  float?: boolean
  className?: string
}) {
  const celebrating = mood === 'celebrate'

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size * (128 / 140) }}
      animate={float ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg viewBox="0 0 140 128" width="100%" height="100%" overflow="visible">
        <defs>
          <linearGradient id="finn-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD5C2" />
            <stop offset="100%" stopColor="#F8B6D2" />
          </linearGradient>
          <linearGradient id="finn-fin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6D9FC" />
            <stop offset="100%" stopColor="#C4AEF4" />
          </linearGradient>
        </defs>

        {/* bubbles */}
        {float &&
          [
            { cx: 18, cy: 40, r: 3.5, d: 0 },
            { cx: 10, cy: 26, r: 2.5, d: 0.9 },
            { cx: 22, cy: 16, r: 1.8, d: 1.7 },
          ].map((b) => (
            <motion.circle
              key={b.d}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill="none"
              stroke="#A9D8F5"
              strokeWidth={1.6}
              animate={{ y: [4, -6], opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: b.d, ease: 'easeOut' }}
            />
          ))}

        {/* tail */}
        <motion.path
          d="M102 62 C112 50 122 42 131 42 C126 52 126 64 131 77 C121 77 111 70 102 66 Z"
          fill="url(#finn-fin)"
          style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
          animate={{ rotate: celebrating ? [-12, 12, -12] : [-5, 5, -5] }}
          transition={{ duration: celebrating ? 0.5 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M114 54 L124 50 M114 66 L124 70" stroke="#B49AEE" strokeWidth={1.6} strokeLinecap="round" />

        {/* crest */}
        <path
          d="M40 38 C42 22 56 14 64 24 C68 12 86 12 89 32 C76 30 54 32 40 38 Z"
          fill="url(#finn-fin)"
        />

        {/* body */}
        <ellipse cx={64} cy={72} rx={46} ry={42} fill="url(#finn-body)" />
        <ellipse cx={62} cy={92} rx={28} ry={17} fill="#FFF3EC" opacity={0.75} />
        <ellipse cx={42} cy={47} rx={10} ry={5.5} fill="#fff" opacity={0.6} transform="rotate(-30 42 47)" />
        {/* scales */}
        <path
          d="M92 58 q4 4 0 8 M98 70 q4 4 0 8 M90 80 q4 4 0 8"
          stroke="#EE9DBF"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* side fins */}
        <motion.path
          d="M24 80 C12 74 5 82 8 91 C13 95 20 92 27 87 Z"
          fill="url(#finn-fin)"
          style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}
          animate={{ rotate: celebrating ? [0, 28, 0] : [0, 6, 0] }}
          transition={{ duration: celebrating ? 0.45 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M104 82 C116 76 123 84 120 93 C115 97 108 94 101 89 Z"
          fill="url(#finn-fin)"
          style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
          animate={{ rotate: celebrating ? [0, -28, 0] : [0, -6, 0] }}
          transition={{ duration: celebrating ? 0.45 : 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        />

        {/* cheeks */}
        <ellipse cx={38} cy={82} rx={7} ry={4.2} fill="#F27FA8" opacity={0.45} />
        <ellipse cx={90} cy={82} rx={7} ry={4.2} fill="#F27FA8" opacity={0.45} />

        {/* face */}
        {celebrating ? (
          <g stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none">
            <path d="M43 71 Q50 61 57 71" />
            <path d="M71 71 Q78 61 85 71" />
          </g>
        ) : (
          <motion.g
            style={fill}
            animate={{ scaleY: [1, 1, 0.12, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
          >
            <ellipse cx={50} cy={69} rx={6.2} ry={7.6} fill={INK} />
            <ellipse cx={78} cy={69} rx={6.2} ry={7.6} fill={INK} />
            <circle cx={52.2} cy={66} r={2.3} fill="#fff" />
            <circle cx={80.2} cy={66} r={2.3} fill="#fff" />
            <circle cx={48.4} cy={72.4} r={1} fill="#fff" />
            <circle cx={76.4} cy={72.4} r={1} fill="#fff" />
          </motion.g>
        )}

        {mood === 'happy' && (
          <path d="M58 81 Q64 87.5 70 81" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
        )}

        {mood === 'concerned' && (
          <>
            <g stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
              <path d="M43 58 L55 55" />
              <path d="M73 55 L85 58" />
              <path d="M57 84 Q60.5 81 64 84 Q67.5 87 71 84" />
            </g>
            <motion.path
              d="M100 38 C103 43 104 46 102 48.5 C100 50.5 96.5 50 96.3 46.8 C96.2 44.6 98.4 42 100 38 Z"
              fill="#9FD0F2"
              animate={{ y: [0, 3, 0], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          </>
        )}

        {celebrating && (
          <>
            <path d="M55 79 Q64 94 73 79 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
            <path d="M59.5 85.5 Q64 90.5 68.5 85.5 Q64 83.5 59.5 85.5 Z" fill="#F58BA8" />
            {[
              { x: 14, y: 52, s: 1 },
              { x: 116, y: 30, s: 0.8 },
              { x: 124, y: 98, s: 0.7 },
            ].map((st, i) => (
              <g key={i} transform={`translate(${st.x} ${st.y}) scale(${st.s})`}>
                <motion.path
                  d="M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7 Z"
                  fill="#F5D24A"
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.4] }}
                  style={fill}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              </g>
            ))}
          </>
        )}
      </svg>
    </motion.div>
  )
}
