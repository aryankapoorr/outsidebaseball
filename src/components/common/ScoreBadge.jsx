import { useProjectConfig } from '../../contexts/ProjectContext';
import { scoreColor } from '../../utils/scoreUtils';

export default function ScoreBadge({ value, className = '' }) {
  const config = useProjectConfig();
  const colorClass = config ? scoreColor(value, config.vizConfig.colorBands) : 'text-white';
  return (
    <span className={`font-bold font-mono tabular-nums ${colorClass} ${className}`}>
      {value.toFixed(1)}
    </span>
  );
}
