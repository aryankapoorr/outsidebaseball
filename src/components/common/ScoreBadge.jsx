import { scoreColor } from '../../utils/scoreUtils';

export default function ScoreBadge({ value, className = '' }) {
  return (
    <span className={`font-bold font-mono tabular-nums ${scoreColor(value)} ${className}`}>
      {value.toFixed(1)}
    </span>
  );
}
