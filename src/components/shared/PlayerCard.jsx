import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import { useProjectConfig } from '../../contexts/ProjectContext';

export default function PlayerCard({ csvName, score, rank, onClick }) {
  const { vizConfig } = useProjectConfig();
  const { colorBands, leagueAverage } = vizConfig;
  const pct = Math.min(score / (leagueAverage * 2), 1);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-navy-800 border border-navy-600 rounded-2xl p-4 hover:border-steel-500 hover:bg-navy-700/50 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-steel-400">#{rank}</span>
        <span className={`text-xl font-bold font-mono tabular-nums ${scoreColor(score, colorBands)}`}>
          {score.toFixed(1)}
        </span>
      </div>

      <div className="flex justify-center mb-3">
        <PlayerAvatar csvName={csvName} style={{ width: 80, height: 105 }} className="rounded-lg" />
      </div>

      <p className="text-white font-semibold text-sm text-center truncate mb-3 group-hover:text-steel-400 transition-colors">
        {formatPlayerName(csvName)}
      </p>

      <div className="relative h-1.5 bg-navy-600 rounded-full mb-1">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pct * 100}%`, backgroundColor: scoreStroke(score, colorBands) }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-steel-400/50"
          style={{ left: '50%' }}
        />
      </div>
      <p className="text-steel-400 text-xs text-center opacity-50">avg = {leagueAverage}</p>
    </button>
  );
}
