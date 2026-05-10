import { useState } from 'react';
import { PlayerAvatar, Tooltip } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import { useProjectConfig } from '../../contexts/ProjectContext';
import LineChart from './LineChart';
import StatGroupGrid from './StatGroupGrid';

export default function PlayerDetailExpanded({ csvName, entry }) {
  const { dataSource, vizConfig } = useProjectConfig();
  const { scoreColumn, pitchCountColumn, subScoreColumns = [] } = dataSource;
  const { colorBands } = vizConfig;

  const { byYear, years, overall, totalPitches } = entry;
  const [detailYear, setDetailYear] = useState(years[years.length - 1]);

  const overallSubScores = {};
  for (const { key } of subScoreColumns) {
    let wSum = 0, wTotal = 0;
    for (const yr of years) {
      const pitches = byYear[yr][pitchCountColumn] ?? 1;
      const val     = byYear[yr][key]              ?? null;
      if (val !== null) { wSum += val * pitches; wTotal += pitches; }
    }
    overallSubScores[key] = wTotal > 0 ? wSum / wTotal : null;
  }

  const yearRow   = byYear[detailYear];
  const chartData = years.map((yr) => ({
    year:  String(yr),
    score: parseFloat(byYear[yr][scoreColumn].toFixed(1)),
  }));

  return (
    <div className="border-t border-ob-red/30 bg-navy-800/40">
      {/* Player header */}
      <div className="flex items-center gap-4 pl-5 pr-12 pt-4 pb-3">
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
          {subScoreColumns.length > 0 && (
            <div className="flex gap-3 justify-end mt-1.5">
              {subScoreColumns.map(({ key, label, name }) => (
                <div key={key} className="text-right">
                  <Tooltip content={name}>
                    <span className="inline-flex items-center gap-0.5 cursor-help">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-steel-500">{label}</span>
                      <svg className="w-2.5 h-2.5 text-steel-500/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </Tooltip>
                  <p className={`text-xs font-bold font-mono tabular-nums ${overallSubScores[key] != null ? scoreColor(overallSubScores[key], colorBands) : 'text-steel-500'}`}>
                    {overallSubScores[key] != null ? overallSubScores[key].toFixed(0) : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
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

      {/* Year summary */}
      {subScoreColumns.length > 0 && (
        <div className="px-5 pb-2 flex items-baseline gap-4">
          <span className={`text-sm font-bold font-mono tabular-nums ${scoreColor(yearRow[scoreColumn], colorBands)}`}>
            {yearRow[scoreColumn]?.toFixed(1)}
          </span>
          <span className="text-steel-500 text-xs">·</span>
          {subScoreColumns.map(({ key, label, name }) => (
            <div key={key} className="flex items-baseline gap-1">
              <Tooltip content={name}>
                <span className="inline-flex items-center gap-0.5 cursor-help">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-steel-500 leading-none">{label}</span>
                  <svg className="w-2.5 h-2.5 text-steel-500/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Tooltip>
              <span className={`text-xs font-bold font-mono tabular-nums leading-none ${yearRow[key] != null ? scoreColor(yearRow[key], colorBands) : 'text-steel-500'}`}>
                {yearRow[key]?.toFixed(0) ?? '—'}
              </span>
            </div>
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
