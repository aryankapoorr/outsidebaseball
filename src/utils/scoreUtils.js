export const STANDARD_COLOR_BANDS = [
  { min: 130, tailwind: 'text-green-400',  hex: '#4ade80' },
  { min: 110, tailwind: 'text-cyan-400',   hex: '#22d3ee' },
  { min: 90,  tailwind: 'text-gray-200',   hex: '#e5e7eb' },
  { min: 70,  tailwind: 'text-orange-400', hex: '#fb923c' },
  { min: 0,   tailwind: 'text-red-400',    hex: '#f87171' },
];

export function scoreColor(val, bands = STANDARD_COLOR_BANDS) {
  for (const band of bands) {
    if (val >= band.min) return band.tailwind;
  }
  return bands[bands.length - 1]?.tailwind ?? 'text-white';
}

export function scoreStroke(val, bands = STANDARD_COLOR_BANDS) {
  for (const band of bands) {
    if (val >= band.min) return band.hex;
  }
  return bands[bands.length - 1]?.hex ?? '#ffffff';
}
