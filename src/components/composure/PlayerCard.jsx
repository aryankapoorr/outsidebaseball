import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';

export default function PlayerCard({ csvName, score, rank, onClick }) {
  const pct = Math.min(score / 200, 1);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-navy-800 border border-navy-600 rounded-2xl p-4 hover:border-steel-500 hover:bg-navy-700/50 transition-all group cursor-pointer"
    >
      {/* Rank + score */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-steel-400">#{rank}</span>
        <span className={`text-xl font-bold font-mono tabular-nums ${scoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>

      {/* Photo */}
      <div className="flex justify-center mb-3">
        <PlayerAvatar csvName={csvName} style={{ width: 80, height: 105 }} className="rounded-lg" />
      </div>

      {/* Name */}
      <p className="text-white font-semibold text-sm text-center truncate mb-3 group-hover:text-steel-400 transition-colors">
        {formatPlayerName(csvName)}
      </p>

      {/* Score bar */}
      <div className="relative h-1.5 bg-navy-600 rounded-full mb-1">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pct * 100}%`, backgroundColor: scoreStroke(score) }}
        />
        {/* League avg tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-steel-400/50"
          style={{ left: '50%' }}
        />
      </div>
      <p className="text-steel-400 text-xs text-center opacity-50">avg = 100</p>
    </button>
  );
}
