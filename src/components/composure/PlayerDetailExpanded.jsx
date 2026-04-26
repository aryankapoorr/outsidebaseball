import { useState } from 'react';
import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import ComposureChart from './ComposureChart';
import StatGroupGrid from './StatGroupGrid';

export default function PlayerDetailExpanded({ csvName, entry }) {
  const { byYear, years, overall, totalPitches } = entry;
  const [detailYear, setDetailYear] = useState(years[years.length - 1]);

  const yearRow   = byYear[detailYear];
  const chartData = years.map((yr) => ({
    year:  String(yr),
    score: parseFloat(byYear[yr].composure_plus.toFixed(1)),
  }));

  return (
    <div className="px-5 pb-5 pt-3 border-t border-navy-600 bg-navy-800/40">
      {/* Player header */}
      <div className="flex items-center gap-4 mb-5">
        <PlayerAvatar csvName={csvName} style={{ width: 56, height: 74 }} />
        <div>
          <h3 className="text-lg font-bold text-white">{formatPlayerName(csvName)}</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-2xl font-bold font-mono tabular-nums ${scoreColor(overall)}`}>
              {overall.toFixed(1)}
            </span>
            <span className="text-steel-400 text-xs">Overall Composure+</span>
          </div>
          <p className="text-navy-500 text-xs mt-1" style={{ color: '#7aaad4', opacity: 0.7 }}>
            {years.length} season{years.length !== 1 ? 's' : ''} · {totalPitches.toLocaleString()} total pitches
          </p>
        </div>
      </div>

      {/* YoY chart */}
      {years.length > 1 && (
        <div className="bg-navy-900/60 border border-navy-600 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-steel-400 uppercase tracking-wider mb-3">
            Composure+ Year over Year
          </p>
          <ComposureChart data={chartData} lineColor={scoreStroke(overall)} />
        </div>
      )}

      {/* Year selector + stats */}
      <div className="bg-navy-900/60 border border-navy-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-navy-950/60 rounded-lg p-1">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setDetailYear(yr)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  detailYear === yr
                    ? 'bg-navy-700 text-white border border-navy-500'
                    : 'text-steel-400 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold font-mono tabular-nums ${scoreColor(yearRow.composure_plus)}`}>
              {yearRow.composure_plus.toFixed(1)}
            </span>
            <p className="text-steel-400 text-xs opacity-70">{yearRow.pitch_count.toLocaleString()} pitches</p>
          </div>
        </div>
        <StatGroupGrid yearRow={yearRow} />
      </div>
    </div>
  );
}
