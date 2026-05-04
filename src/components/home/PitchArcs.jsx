import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Batter's perspective: release point is the vanishing point (top center),
// pitches fan out to their landing location in/near the strike zone.
// x-right = glove side (away to RHB), x-left = arm side (inside to RHB)

const RX = 200;
const RY = 18;
const ZONE = { x: 108, y: 62, w: 184, h: 178 };

const PATH_DUR = 1.25;
const BALL_DUR = 0.9;

const PITCHES = [
  // 4-Seam: slight arm-side ride, high in zone
  { label: '4-Seam',    d: `M ${RX},${RY} C 200,58 191,78 183,92`,    color: '#7aaad4', delay: 0    },
  // Sinker: runs hard arm-side + sinks to low-inside corner
  { label: 'Sinker',    d: `M ${RX},${RY} C 196,85 158,162 132,218`,  color: '#a78bfa', delay: 0.2  },
  // Cutter: holds then cuts late to glove side, mid-away
  { label: 'Cutter',    d: `M ${RX},${RY} C 200,78 236,108 252,128`,  color: '#f472b6', delay: 0.4  },
  // Curveball: 12-6 drop, slight glove-side drift, ends low
  { label: 'Curveball', d: `M ${RX},${RY} C 210,88 214,182 210,232`,  color: '#4ade80', delay: 0.6  },
  // Slider: sharp glove-side + down, late break
  { label: 'Slider',    d: `M ${RX},${RY} C 202,85 244,148 262,172`,  color: '#fb923c', delay: 0.8  },
  // Sweeper: massive horizontal sweep away, minimal drop
  { label: 'Sweeper',   d: `M ${RX},${RY} C 205,74 270,112 298,148`,  color: '#fbbf24', delay: 1.0  },
  // Changeup: fades arm-side + drops, mirrors fastball shape
  { label: 'Changeup',  d: `M ${RX},${RY} C 194,86 172,170 165,220`,  color: '#22d3ee', delay: 1.2  },
  // Splitter: straight then hard late dive — control pts stay center
  { label: 'Splitter',  d: `M ${RX},${RY} C 200,78 200,160 200,240`,  color: '#f87171', delay: 1.4  },
];

function PitchArcsInner() {
  return (
    <svg viewBox="0 0 400 285" className="w-full h-full" fill="none">

      {/* Perspective lines — zone corners to release point, sell the depth */}
      <line x1={ZONE.x}          y1={ZONE.y}          x2={RX} y2={RY} stroke="#243656" strokeWidth="0.8" opacity="0.55" />
      <line x1={ZONE.x + ZONE.w} y1={ZONE.y}          x2={RX} y2={RY} stroke="#243656" strokeWidth="0.8" opacity="0.55" />
      <line x1={ZONE.x}          y1={ZONE.y + ZONE.h} x2={RX} y2={RY} stroke="#243656" strokeWidth="0.5" opacity="0.3"  />
      <line x1={ZONE.x + ZONE.w} y1={ZONE.y + ZONE.h} x2={RX} y2={RY} stroke="#243656" strokeWidth="0.5" opacity="0.3"  />

      {/* Strike zone */}
      <rect x={ZONE.x} y={ZONE.y} width={ZONE.w} height={ZONE.h}
        stroke="#2d4470" strokeWidth="1.5" fill="#162032" fillOpacity="0.5" />
      {/* 9-box grid */}
      {[1, 2].map(n => (
        <g key={n}>
          <line x1={ZONE.x + ZONE.w * n / 3} y1={ZONE.y}
                x2={ZONE.x + ZONE.w * n / 3} y2={ZONE.y + ZONE.h}
                stroke="#1e2f48" strokeWidth="0.75" />
          <line x1={ZONE.x}          y1={ZONE.y + ZONE.h * n / 3}
                x2={ZONE.x + ZONE.w} y2={ZONE.y + ZONE.h * n / 3}
                stroke="#1e2f48" strokeWidth="0.75" />
        </g>
      ))}

      {/* Home plate */}
      <path d="M 182,252 L 218,252 L 218,265 L 200,275 L 182,265 Z"
        fill="#162032" stroke="#2d4470" strokeWidth="1.5" />

      {/* Release point */}
      <circle cx={RX} cy={RY} r="2.5" fill="#162032" stroke="#2d4470" strokeWidth="1.5" />

      {/* Pitch arcs + traveling ball */}
      {PITCHES.map(({ label, d, color, delay }) => (
        <g key={label}>
          <motion.path
            d={d}
            stroke={color}
            strokeWidth="2.75"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.88 }}
            transition={{
              pathLength: { duration: PATH_DUR, delay, ease: 'easeOut' },
              opacity:    { duration: 0.12, delay },
            }}
          />
          <circle r="5.5" fill="white" fillOpacity="0.95">
            <animateMotion
              dur={`${BALL_DUR}s`}
              begin={`${delay + PATH_DUR}s`}
              fill="remove"
              path={d}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.04;0.78;1"
              dur={`${BALL_DUR}s`}
              begin={`${delay + PATH_DUR}s`}
              fill="remove"
            />
          </circle>
        </g>
      ))}

      {/* Legend */}
      {PITCHES.map(({ label, color, delay }, i) => (
        <motion.text
          key={label}
          x="396" y={18 + i * 13}
          fill={color} fontSize="9"
          textAnchor="end" fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.88 }}
          transition={{ delay: delay + PATH_DUR * 0.6, duration: 0.2 }}
        >
          {label}
        </motion.text>
      ))}
    </svg>
  );
}

export default function PitchArcs() {
  const [cycle, setCycle] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const lastDelay  = PITCHES[PITCHES.length - 1].delay;
    const allDone    = (lastDelay + PATH_DUR + BALL_DUR) * 1000; // ms when last ball finishes
    const holdMs     = 1100;                                       // pause before fade
    const fadeDurMs  = 550;

    const t1 = setTimeout(() => setFading(true),  allDone + holdMs);
    const t2 = setTimeout(() => {
      setCycle(c => c + 1);
      setFading(false);
    }, allDone + holdMs + fadeDurMs);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [cycle]);

  return (
    <motion.div
      className="w-full h-full"
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: fading ? 0.55 : 0 }}
    >
      <PitchArcsInner key={cycle} />
    </motion.div>
  );
}
