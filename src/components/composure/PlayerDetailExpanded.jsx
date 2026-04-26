import { useState } from 'react';
import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import ComposureChart from './ComposureChart';
import { STAT_GROUPS } from '../../services/composureService';

export default function PlayerDetailExpanded({ csvName, entry }) {
  const { byYear, years, overall, totalPitches } = entry;
  const [detailYear, setDetailYear] = useState(years[years.length - 1]);

  const yearRow   = byYear[detailYear];
  const chartData = years.map((yr) => ({
    year:  String(yr),
    score: parseFloat(byYear[yr].composure_plus.toFixed(1)),
  }));

  return (
    <div className="border-t border-navy-600 bg-navy-800/40">
      {/* Player header */}
      <div className="flex items-center gap-4 px-5 pt-4 pb-3">
        <PlayerAvatar csvName={csvName} style={{ width: 48, height: 63 }} />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white">{formatPlayerName(csvName)}</h3>
          <p className="text-steel-400 text-xs mt-0.5">
            {years.length} season{years.length !== 1 ? 's' : ''} · {totalPitches.toLocaleString()} pitches
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-2xl font-bold font-mono tabular-nums ${scoreColor(overall)}`}>
            {overall.toFixed(1)}
          </span>
          <p className="text-steel-400 text-xs">Overall</p>
        </div>
      </div>

      {/* YoY chart — prominent, full width */}
      {years.length > 1 && (
        <div className="px-5 pb-3">
          <div className="bg-navy-900/60 border border-navy-600 rounded-xl px-4 pt-3 pb-2">
            <p className="text-xs font-semibold text-steel-400 uppercase tracking-wider mb-2">
              Composure+ Over Time
            </p>
            <ComposureChart data={chartData} lineColor={scoreStroke(overall)} />
          </div>
        </div>
      )}

      {/* Year selector + compressed stats */}
      <div className="px-5 pb-5">
        <div className="bg-navy-900/60 border border-navy-600 rounded-xl p-4">
          {/* Year tabs + year score */}
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

          {/* Compressed stat groups */}
          <div className="space-y-4">
            {STAT_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                  {group.note && (
                    <span className="text-xs text-steel-400 opacity-40">· {group.note}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {group.keys.map(([key, label]) => {
                    const val = yearRow[key];
                    if (val == null) return null;
                    return (
                      <div key={key} className="bg-navy-950/70 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs text-steel-400 opacity-60 mb-0.5 truncate">{label}</p>
                        <p className="font-mono text-sm font-medium text-white leading-none">
                          {(val * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
