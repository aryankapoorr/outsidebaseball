import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import { motion } from 'framer-motion';

// Coordinate system (feet):
// X = right (glove-side / away from RHB)
// Y = up
// Z = positive toward pitcher (home plate = 0, mound = 55)

const TRAVEL_DURATION = 2.8; // seconds for a pitch to travel from release to plate

const PITCHES = [
  {
    label: '4-Seam', color: '#7aaad4',
    // Arm-side ride, stays elevated — high fastball
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.3, 4.8, 35),
      new Vector3(-0.9, 3.5, 15),
      new Vector3(-0.55, 2.8, 0),
    ],
  },
  {
    label: 'Sinker', color: '#a78bfa',
    // Hard arm-side run + sink to low-inside corner
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.5, 4.5, 35),
      new Vector3(-1.4, 2.8, 15),
      new Vector3(-1.15, 1.55, 0),
    ],
  },
  {
    label: 'Cutter', color: '#f472b6',
    // Holds fastball shape then cuts glove-side late
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.3, 4.6, 35),
      new Vector3(-0.4, 3.2, 15),
      new Vector3(0.55, 2.4, 0),
    ],
  },
  {
    label: 'Curveball', color: '#4ade80',
    // 12-6 drop with hump — rises briefly then dives sharply
    points: [
      new Vector3(-1.5, 6.2, 55),
      new Vector3(-1.1, 6.8, 38),
      new Vector3(-0.3, 4.2, 20),
      new Vector3(0.4, 1.3, 0),
    ],
  },
  {
    label: 'Slider', color: '#fb923c',
    // Sharp glove-side break + downward tilt, late movement
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.2, 4.8, 35),
      new Vector3(0.0, 3.3, 15),
      new Vector3(0.85, 1.9, 0),
    ],
  },
  {
    label: 'Sweeper', color: '#fbbf24',
    // Massive horizontal sweep glove-side, minimal drop
    points: [
      new Vector3(-1.5, 5.6, 55),
      new Vector3(-1.0, 4.3, 35),
      new Vector3(0.8, 3.0, 15),
      new Vector3(1.6, 2.1, 0),
    ],
  },
  {
    label: 'Changeup', color: '#22d3ee',
    // Arm-side fade with extra drop vs fastball
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.4, 4.4, 35),
      new Vector3(-1.1, 2.8, 15),
      new Vector3(-0.8, 1.75, 0),
    ],
  },
  {
    label: 'Splitter', color: '#f87171',
    // Carries like a fastball then dives hard below zone
    points: [
      new Vector3(-1.5, 5.8, 55),
      new Vector3(-1.2, 4.9, 35),
      new Vector3(-0.5, 3.5, 12),
      new Vector3(-0.2, 2.0, 5),
      new Vector3(-0.1, 1.1, 0),
    ],
  },
];

// --- Scene components ---

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 2.5, 5);
  }, [camera]);
  return null;
}

function StrikeZone() {
  const hw = 0.71;
  const bot = 1.5, top = 3.5, z = 0.5;
  const h = top - bot;
  const outer = '#2d4470';
  const grid  = '#1a2d48';

  return (
    <group>
      {/* Outer frame */}
      <Line points={[[-hw, bot, z], [hw, bot, z]]}  color={outer} lineWidth={1.5} />
      <Line points={[[-hw, top, z], [hw, top, z]]}  color={outer} lineWidth={1.5} />
      <Line points={[[-hw, bot, z], [-hw, top, z]]} color={outer} lineWidth={1.5} />
      <Line points={[[hw, bot, z], [hw, top, z]]}   color={outer} lineWidth={1.5} />
      {/* 9-box grid */}
      <Line points={[[-hw/3, bot, z], [-hw/3, top, z]]} color={grid} lineWidth={0.6} />
      <Line points={[[ hw/3, bot, z], [ hw/3, top, z]]} color={grid} lineWidth={0.6} />
      <Line points={[[-hw, bot + h/3, z], [hw, bot + h/3, z]]}   color={grid} lineWidth={0.6} />
      <Line points={[[-hw, bot + h*2/3, z], [hw, bot + h*2/3, z]]} color={grid} lineWidth={0.6} />
    </group>
  );
}

function HomePlate() {
  const vertices = useMemo(() => {
    // Pentagon in the XZ plane (horizontal), at Y=0.02
    const pts = [
      [-0.43, 0, 0.2],
      [ 0.43, 0, 0.2],
      [ 0.43, 0, -0.3],
      [ 0.0,  0, -0.6],
      [-0.43, 0, -0.3],
    ];
    const flat = [];
    for (let i = 0; i < pts.length - 1; i++) {
      flat.push(...pts[i], ...pts[(i + 1) % pts.length]);
    }
    flat.push(...pts[pts.length - 1], ...pts[0]);
    return new Float32Array(flat);
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[vertices, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#2d4470" />
    </lineSegments>
  );
}

// One pitch: growing trail leading from release + traveling ball
function PitchArc({ pitch, isActive, isCompleted, onComplete }) {
  const [t, setT] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const curve = useMemo(() => new CatmullRomCurve3(pitch.points), [pitch]);
  const fullPath = useMemo(() => curve.getPoints(80), [curve]);

  useFrame((_, delta) => {
    if (!isActive || t >= 1) return;
    setT(prev => {
      const next = Math.min(1, prev + delta / TRAVEL_DURATION);
      if (next >= 1 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return next;
    });
  });

  const trailPoints = useMemo(
    () => (isActive && t > 0.01) ? curve.getPoints(Math.max(3, Math.ceil(80 * t))) : null,
    [isActive, t, curve],
  );

  const ballPos = (isActive && t < 1) ? curve.getPoint(Math.min(t, 0.999)) : null;
  const ballOpacity = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;

  if (!isCompleted && !isActive) return null;

  return (
    <group>
      {/* Completed: show full static trail */}
      {isCompleted && (
        <Line points={fullPath} color={pitch.color} lineWidth={3.5} />
      )}
      {/* Active: trail grows as ball travels */}
      {isActive && trailPoints && (
        <Line points={trailPoints} color={pitch.color} lineWidth={3.5} />
      )}
      {/* Traveling ball */}
      {ballPos && (
        <mesh position={ballPos}>
          <sphereGeometry args={[0.075, 16, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.2}
            transparent
            opacity={ballOpacity}
          />
        </mesh>
      )}
    </group>
  );
}

// --- Root component ---

export default function PitchArcs3D() {
  const [cycle, setCycle]           = useState(0);
  const [activePitch, setActivePitch] = useState(0);
  const [fading, setFading]         = useState(false);
  const timers = useRef([]);

  // Cleanup all pending timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handlePitchComplete = useCallback(() => {
    setActivePitch(prev => {
      const next = prev + 1;
      if (next >= PITCHES.length) {
        // All pitches shown — hold, then fade and reset
        const t1 = setTimeout(() => {
          setFading(true);
          const t2 = setTimeout(() => {
            setFading(false);
            setCycle(c => c + 1);
            setActivePitch(0);
          }, 550);
          timers.current.push(t2);
        }, 1600);
        timers.current.push(t1);
      }
      return next;
    });
  }, []);

  return (
    <motion.div
      className="w-full h-full relative"
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: fading ? 0.5 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 3.5, -4], fov: 65, near: 0.1, far: 200 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <CameraSetup />
        <ambientLight intensity={0.35} />
        <directionalLight position={[2, 8, 25]} intensity={0.5} />
        <StrikeZone />
        <HomePlate />
        {PITCHES.map((pitch, i) => (
          <PitchArc
            key={`${cycle}-${i}`}
            pitch={pitch}
            isActive={i === activePitch}
            isCompleted={i < activePitch}
            onComplete={i === activePitch ? handlePitchComplete : undefined}
          />
        ))}
      </Canvas>

      {/* Pitch name legend — lights up as each pitch plays */}
      <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-[3px] pointer-events-none">
        {PITCHES.map((pitch, i) => (
          <motion.span
            key={pitch.label}
            className="text-[9px] font-mono text-right block leading-none"
            style={{ color: pitch.color }}
            animate={{ opacity: i < activePitch ? 0.7 : i === activePitch ? 1 : 0.18 }}
            transition={{ duration: 0.25 }}
          >
            {pitch.label}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
