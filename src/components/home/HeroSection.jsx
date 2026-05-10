import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Papa from 'papaparse';
import { SITE } from '../../data/site';
import { PROJECTS } from '../../data/projects';

const FLIP_MS = 90;  // ms for the flap to fall
const TICK    = 115; // ms between count-up steps
const STEPS   = 28;  // count-up steps (ease-out-cubic over STEPS × TICK ms)

// Always returns exactly 7 digits (leading zeros)
function toDigits7(n) {
  return n.toString().padStart(7, '0').slice(-7).split('').map(Number);
}

// ─── One flip-clock slot ──────────────────────────────────────────────────
//
// Three layers:
//   1. Top-back  — static, behind the flap; shows incoming while flipping
//   2. Flap      — top half of current digit, rotates down (falls to -90°)
//   3. Bottom    — static, always shows current `shown`
//
// When the flap reaches -90° it becomes invisible (backface-hidden).
// At that point the state settles: shown→incoming, flipping→false.
// The flap remounts at 0° with the new digit — seamless transition.

function DigitCard({ digit, flipMs = 50 }) {
  const controls   = useAnimation();
  const shownRef   = useRef(digit);
  const pendingRef = useRef(null);
  const busyRef    = useRef(false);

  // `bottom` drives the bottom half and top-back when idle
  // `flapDigit` drives what the flap card shows (old digit falling, new digit rising)
  // `topBack`   drives what's visible behind the flap (new digit revealed as flap falls)
  const [bottom,    setBottom]    = useState(digit);
  const [flapDigit, setFlapDigit] = useState(digit);
  const [topBack,   setTopBack]   = useState(digit);

  // Stored in a ref so the async function always closes over the latest version
  const runRef = useRef(null);
  runRef.current = async function run() {
    const to = pendingRef.current;
    if (to === null || to === shownRef.current) { busyRef.current = false; return; }
    pendingRef.current = null;
    busyRef.current    = true;

    // Reveal the incoming digit behind the flap immediately (it's hidden by the flap)
    setTopBack(to);

    // Phase 1 — fall: flap (old digit) rotates from 0° → -90°
    await controls.start({
      rotateX:    -90,
      transition: { duration: flipMs / 1000, ease: [0.55, 0, 1, 0.45] },
    });

    // Midpoint — flap is edge-on (invisible); switch all content to new digit
    shownRef.current = to;
    setBottom(to);
    setFlapDigit(to);

    // Phase 2 — rise: flap (new digit) rotates from -90° → 0°
    await controls.start({
      rotateX:    0,
      transition: { duration: flipMs / 1000, ease: [0, 0.55, 0.45, 1] },
    });

    busyRef.current = false;
    if (pendingRef.current !== null) runRef.current();
  };

  useEffect(() => {
    if (digit === shownRef.current) return;
    pendingRef.current = digit;
    if (!busyRef.current) runRef.current();
  }, [digit]);

  const W = '3.45rem';
  const H = '4.77rem';

  const numStyle = {
    fontSize:           '2.65rem',
    fontWeight:         700,
    color:              '#fff',
    lineHeight:         1,
    fontVariantNumeric: 'tabular-nums',
  };
  const centerIn = (anchor) => ({
    position: 'absolute', [anchor]: 0, left: 0, right: 0,
    height: '200%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <div style={{ position: 'relative', width: W, height: H, perspective: '250px', userSelect: 'none' }}>

      {/* Top-back: new digit waiting behind the flap */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', overflow: 'hidden', background: '#162236', borderRadius: '4px 4px 0 0' }}>
        <div style={centerIn('top')}>
          <span style={numStyle}>{topBack}</span>
        </div>
      </div>

      {/* Flap: single persistent element, animated by controls — no remounting */}
      <motion.div
        animate={controls}
        style={{
          position:           'absolute',
          top: 0, left: 0, right: 0,
          height:             '50%',
          overflow:           'hidden',
          background:         '#1e2f46',
          borderRadius:       '4px 4px 0 0',
          transformOrigin:    '50% 100%',
          backfaceVisibility: 'hidden',
          zIndex:             10,
        }}
      >
        <div style={centerIn('top')}>
          <span style={numStyle}>{flapDigit}</span>
        </div>
      </motion.div>

      {/* Bottom: snaps to new digit at the midpoint */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', overflow: 'hidden', background: '#0e1a28', borderRadius: '0 0 4px 4px' }}>
        <div style={centerIn('bottom')}>
          <span style={numStyle}>{bottom}</span>
        </div>
      </div>

      {/* Center seam */}
      <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.85)', zIndex: 20 }} />
    </div>
  );
}

// ─── 7-slot flip counter ──────────────────────────────────────────────────

function FlipCounter({ value, label, suffix = '' }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!value) return;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const t     = step / STEPS;
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setCurrent(step >= STEPS ? value : Math.round(eased * value));
      if (step >= STEPS) clearInterval(id);
    }, TICK);
    return () => clearInterval(id);
  }, [value]);

  const [d0, d1, d2, d3, d4, d5, d6] = toDigits7(current);

  const commaStyle = {
    color:      'rgba(255,255,255,0.15)',
    fontWeight: 700,
    fontSize:   '1.46rem',
    alignSelf:  'center',
    margin:     '0 1px',
    lineHeight: 1,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '3px' }}>
        <DigitCard digit={d0} flipMs={54} />
        <span style={commaStyle}>,</span>
        <DigitCard digit={d1} flipMs={50} />
        <DigitCard digit={d2} flipMs={46} />
        <DigitCard digit={d3} flipMs={42} />
        <span style={commaStyle}>,</span>
        <DigitCard digit={d4} flipMs={38} />
        <DigitCard digit={d5} flipMs={34} />
        <DigitCard digit={d6} flipMs={30} />
        {suffix && (
          <span style={{
            color:      '#ffffff',
            fontWeight: 700,
            fontSize:   '2.65rem',
            alignSelf:  'center',
            marginLeft: '4px',
            lineHeight: 1,
          }}>
            {suffix}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-steel-500 mt-3">
        {label}
      </p>
    </div>
  );
}

// ─── Data statement ───────────────────────────────────────────────────────

function DataStatement({ totalPlayers }) {
  return (
    <motion.p
      className="text-sm sm:text-base font-light italic text-steel-400/60 leading-relaxed"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      Context-driven metrics for{' '}
      <span className="text-ob-red-light font-medium not-italic">{totalPlayers}+</span>{' '}
      qualified MLB pitchers
    </motion.p>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.10, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Hero ─────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let pitchEvents = 0;
      let playerCount = 0;

      try {
        await Promise.all(PROJECTS.map(async (proj) => {
          const { dataSource } = proj;

          const res            = await fetch(`${dataSource.s3Base}${dataSource.seasonsPath}`);
          const { seasons }    = await res.json();
          const sorted         = [...seasons].sort((a, b) => a - b);

          const latest         = sorted[sorted.length - 1];
          const latestPath     = dataSource.dataPattern.replace('{year}', latest);
          const latestRes      = await fetch(`${dataSource.s3Base}${latestPath}`);
          const { data: ld }   = Papa.parse(await latestRes.text(), {
            header: true, skipEmptyLines: true, dynamicTyping: true,
          });
          playerCount += ld.length;

          await Promise.all(sorted.map(async (yr) => {
            const path   = dataSource.dataPattern.replace('{year}', yr);
            const csvRes = await fetch(`${dataSource.s3Base}${path}`);
            const { data } = Papa.parse(await csvRes.text(), {
              header: true, skipEmptyLines: true, dynamicTyping: true,
            });
            data.forEach(row => { pitchEvents += (row[dataSource.pitchCountColumn] ?? 0); });
          }));
        }));
      } catch {
        // fail silently
      }

      if (!cancelled) setHeroData({ totalPlayers: Math.floor(playerCount / 50) * 50, totalPitchEvents: pitchEvents });
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900 border-b border-ob-red/30">
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: 'radial-gradient(circle, #243656 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      <div className="container max-w-6xl relative z-10 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Brand column */}
          <motion.div
            className="flex-shrink-0 lg:w-[320px]"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <h1 className="leading-none tracking-tight">
              <motion.span variants={itemVariants} className="block text-5xl sm:text-6xl lg:text-7xl font-light text-white">
                Outside
              </motion.span>
              <motion.span variants={itemVariants} className="block text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                Baseball
              </motion.span>
            </h1>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl font-light italic text-steel-400 mt-4">
              {SITE.about[0].text}
            </motion.p>

          </motion.div>

          {/* Data column */}
          <div className="flex-1 flex flex-col justify-center gap-6 min-w-0">
            {heroData ? (
              <motion.div
                className="flex flex-col gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <FlipCounter
                  value={heroData.totalPitchEvents}
                  label="Pitch Events Analyzed"
                />
                <DataStatement totalPlayers={heroData.totalPlayers} />
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="rounded bg-navy-700/40 animate-pulse" style={{ height: '4.77rem', width: 'calc(7 * 3.45rem + 6 * 3px + 2 * 1.5rem)' }} />
                <div className="h-3 w-48 rounded bg-navy-700/30 animate-pulse" />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
