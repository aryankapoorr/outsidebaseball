import { useState } from 'react';

export default function ComposureChart({ data, lineColor }) {
  const [tooltip, setTooltip] = useState(null);

  const W = 520, H = 180;
  const PAD = { top: 16, right: 28, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const scores = data.map((d) => d.score);
  const rawMin = Math.min(...scores);
  const rawMax = Math.max(...scores);
  const domainMin = Math.max(0, Math.floor(Math.min(rawMin, 100) * 0.92));
  const domainMax = Math.ceil(Math.max(rawMax, 100) * 1.05);
  const domainRange = domainMax - domainMin;

  const xOf = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yOf = (v) => PAD.top  + (1 - (v - domainMin) / domainRange) * innerH;

  const polyline = data.map((d, i) => `${xOf(i)},${yOf(d.score)}`).join(' ');
  const refY = yOf(100);

  const tickStep = Math.ceil(domainRange / 4 / 10) * 10;
  const yTicks = [];
  for (let v = Math.ceil(domainMin / tickStep) * tickStep; v <= domainMax; v += tickStep) {
    yTicks.push(v);
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map((v) => (
          <line key={v} x1={PAD.left} x2={W - PAD.right} y1={yOf(v)} y2={yOf(v)} stroke="#243656" strokeWidth={1} />
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={refY} y2={refY} stroke="#4e82c0" strokeWidth={1} strokeOpacity={0.4} strokeDasharray="5 4" />
        <text x={W - PAD.right + 4} y={refY + 4} fill="#7aaad4" fontSize={10}>avg</text>
        {yTicks.map((v) => (
          <text key={v} x={PAD.left - 6} y={yOf(v) + 4} fill="#7aaad4" fontSize={11} textAnchor="end">{v}</text>
        ))}
        {data.map((d, i) => (
          <text key={d.year} x={xOf(i)} y={H - PAD.bottom + 16} fill="#7aaad4" fontSize={12} textAnchor="middle">{d.year}</text>
        ))}
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.year} onMouseEnter={() => setTooltip({ i, d })}>
            <circle cx={xOf(i)} cy={yOf(d.score)} r={tooltip?.i === i ? 7 : 5} fill={lineColor} stroke="#0f1923" strokeWidth={2} style={{ transition: 'r 0.1s' }} />
            <circle cx={xOf(i)} cy={yOf(d.score)} r={16} fill="transparent" />
          </g>
        ))}
        {tooltip && (() => {
          const cx = xOf(tooltip.i);
          const cy = yOf(tooltip.d.score);
          const bW = 82, bH = 36, bR = 6;
          const bX = Math.min(cx - bW / 2, W - PAD.right - bW);
          const bY = cy - bH - 10;
          return (
            <g>
              <rect x={bX} y={bY} width={bW} height={bH} rx={bR} fill="#0f1923" stroke="#243656" strokeWidth={1} />
              <text x={bX + bW / 2} y={bY + 13} fill="#7aaad4" fontSize={10} textAnchor="middle">{tooltip.d.year}</text>
              <text x={bX + bW / 2} y={bY + 27} fill={lineColor} fontSize={13} fontWeight="bold" textAnchor="middle">{tooltip.d.score.toFixed(1)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
