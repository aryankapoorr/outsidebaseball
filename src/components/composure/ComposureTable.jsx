import { useState, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { METRIC_COLUMNS } from '../../services/composureService';
import { scoreColor } from '../../utils/scoreUtils';
import { PlayerAvatar } from '../common';

function metricClass(val, colKey, rows, lowerIsBetter) {
  const vals = rows.map(r => r[colKey]).filter(v => v != null);
  if (vals.length === 0 || val == null) return 'text-steel-400';
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min;
  if (range === 0) return 'text-steel-400';
  const norm = lowerIsBetter ? 1 - (val - min) / range : (val - min) / range;
  if (norm >= 0.8) return 'text-green-400';
  if (norm >= 0.6) return 'text-cyan-400';
  if (norm >= 0.4) return 'text-white';
  if (norm >= 0.2) return 'text-orange-400';
  return 'text-red-400';
}

export default function ComposureTable({ playerMap, activeSeason }) {
  const [sortKey, setSortKey] = useState('composure_plus');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const result = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        const latestYr = entry.years[entry.years.length - 1];
        const latestRow = entry.byYear[latestYr];
        result.push({ csvName, composure_plus: entry.overall, pitch_count: entry.totalPitches, ...latestRow });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) result.push({ csvName, ...row });
      }
    }
    return result.sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return sortAsc ? av - bv : bv - av;
    });
  }, [playerMap, activeSeason, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <span className="text-navy-500 ml-1">↕</span>;
    return <span className="text-steel-400 ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  const headerCls = 'px-3 py-2.5 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider cursor-pointer hover:text-white whitespace-nowrap select-none transition-colors';

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-navy-600">
        <table className="w-full text-sm">
          <thead className="bg-navy-800/90 sticky top-0 z-10">
            <tr>
              <th className={`${headerCls} sticky left-0 bg-navy-800 z-20 w-8`}>#</th>
              <th className={`${headerCls} sticky left-8 bg-navy-800 z-20 min-w-[160px]`}>
                Player
              </th>
              <th className={headerCls} onClick={() => handleSort('composure_plus')}>
                Composure+ <SortIcon colKey="composure_plus" />
              </th>
              <th className={headerCls} onClick={() => handleSort('pitch_count')}>
                Pitches <SortIcon colKey="pitch_count" />
              </th>
              {METRIC_COLUMNS.map((col) => (
                <th key={col.key} className={headerCls} onClick={() => handleSort(col.key)}>
                  {col.label} <SortIcon colKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.csvName}
                className={`border-t border-navy-600/50 ${i % 2 === 0 ? 'bg-navy-900/60' : 'bg-navy-800/30'}`}
              >
                <td className="px-3 py-2.5 text-steel-400 font-mono sticky left-0 bg-inherit">{i + 1}</td>
                <td className="px-3 py-2.5 sticky left-8 bg-inherit">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar csvName={row.csvName} style={{ width: 28, height: 36 }} />
                    <span className="font-medium text-white whitespace-nowrap">
                      {formatPlayerName(row.csvName)}
                    </span>
                  </div>
                </td>
                <td className={`px-3 py-2.5 font-bold font-mono tabular-nums ${scoreColor(row.composure_plus)}`}>
                  {row.composure_plus?.toFixed(1) ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-white font-mono tabular-nums">
                  {row.pitch_count?.toLocaleString() ?? '—'}
                </td>
                {METRIC_COLUMNS.map((col) => {
                  const val = row[col.key];
                  return (
                    <td key={col.key} className={`px-3 py-2.5 font-mono tabular-nums whitespace-nowrap ${metricClass(val, col.key, rows, col.lowerIsBetter)}`}>
                      {val != null ? `${(val * 100).toFixed(1)}%` : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {activeSeason === 'overall' && (
        <p className="mt-2 text-xs text-steel-400 opacity-50 text-right">
          * Component metrics reflect each pitcher's most recent season
        </p>
      )}
    </div>
  );
}
