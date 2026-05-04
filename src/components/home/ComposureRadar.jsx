import { motion } from 'framer-motion';

const N  = 14;
const CX = 90;
const CY = 90;
const R  = 72;

// Illustrative league-average profile across 14 composure metrics
const VALUES = [0.55, 0.48, 0.60, 0.45, 0.52, 0.58, 0.43, 0.56, 0.50, 0.47, 0.54, 0.51, 0.49, 0.53];

function polarPoint(i, value = 1) {
  const a = (i / N) * 2 * Math.PI - Math.PI / 2;
  return [CX + R * value * Math.cos(a), CY + R * value * Math.sin(a)];
}

const spokeEnds  = Array.from({ length: N }, (_, i) => polarPoint(i));
const ringLevels = [0.25, 0.5, 0.75, 1];

function polygonPath(values) {
  const pts = values.map((v, i) => polarPoint(i, v));
  return `M ${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ')} Z`;
}

export default function ComposureRadar() {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full" fill="none">
      {/* Background rings */}
      {ringLevels.map((r) => (
        <path key={r} d={polygonPath(Array(N).fill(r))} stroke="#243656" strokeWidth="0.75" />
      ))}

      {/* Spokes */}
      {spokeEnds.map(([x, y], i) => (
        <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#243656" strokeWidth="0.75" />
      ))}

      {/* Data polygon */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.8, ease: 'easeOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
      >
        <path
          d={polygonPath(VALUES)}
          fill="#4e82c0"
          fillOpacity="0.18"
          stroke="#4e82c0"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
      </motion.g>

      {/* Center dot */}
      <circle cx={CX} cy={CY} r="2" fill="#4e82c0" fillOpacity="0.6" />
    </svg>
  );
}
