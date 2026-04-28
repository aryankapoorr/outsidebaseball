import { SEASONS } from '../../services/composureService';

/**
 * Season tabs: Overall | 2023 | 2024 | 2025
 */
export default function SeasonSelector({ activeSeason, onChange }) {
  return (
    <div className="flex gap-1 bg-navy-800/60 rounded-xl p-1 border border-navy-600">
      {['overall', ...[...SEASONS].reverse()].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
            activeSeason === s
              ? 'bg-navy-700 text-white border border-navy-500'
              : 'text-steel-400 hover:text-white hover:bg-navy-700/50'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
