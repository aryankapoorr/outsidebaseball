import { useState } from 'react';
import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import { useProjectConfig } from '../../contexts/ProjectContext';
import LineChart from './LineChart';
import StatGroupGrid from './StatGroupGrid';

export default function PlayerDetailExpanded({ csvName, entry }) {
  const { dataSource, vizConfig } = useProjectConfig();
  const { scoreColumn } = dataSource;
  const { colorBands } = vizConfig;

  const { byYear, years, overall, totalPitches } = entry;
  const [detailYear, setDetailYear] = useState(years[years.length - 1]);

  const yearRow   = byYear[detailYear];
  const chartData = years.map((yr) => ({
    year:  String(yr),
    score: parseFloat(byYear[yr][scoreColumn].toFixed(1)),
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
          <span className={`text-2xl font-bold font-mono tabular-nums ${scoreColor(overall, colorBands)}`}>
            {overall.toFixed(1)}
          </span>
          <p className="text-xs text-steel-400 mt-0.5">overall</p>
        </div>
      </div>

      {/* YoY chart */}
      {years.length > 1 && (
        <div className="px-5 pb-3">
          <LineChart data={chartData} lineColor={scoreStroke(overall, colorBands)} />
        </div>
      )}

      {/* Year selector */}
      {years.length > 1 && (
        <div className="flex gap-1 px-5 pb-3 flex-wrap">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setDetailYear(yr)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                detailYear === yr
                  ? 'bg-steel-500 text-white'
                  : 'bg-navy-700 text-steel-400 hover:text-white hover:bg-navy-600'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      )}

      {/* Stat groups */}
      <div className="px-5 pb-5">
        <StatGroupGrid yearRow={yearRow} />
      </div>
    </div>
  );
}
