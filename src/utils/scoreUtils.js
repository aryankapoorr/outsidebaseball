export function scoreColor(val) {
  if (val >= 130) return 'text-green-400';
  if (val >= 110) return 'text-cyan-400';
  if (val >= 90)  return 'text-gray-200';
  if (val >= 70)  return 'text-orange-400';
  return 'text-red-400';
}

export function scoreStroke(val) {
  if (val >= 130) return '#4ade80';
  if (val >= 110) return '#22d3ee';
  if (val >= 90)  return '#e5e7eb';
  if (val >= 70)  return '#fb923c';
  return '#f87171';
}
