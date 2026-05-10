import { useState, useEffect, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreStroke, scoreColor } from '../../utils/scoreUtils';
import { useProjectConfig } from '../../contexts/ProjectContext';
import { PlayerAvatar, PitchSlider } from '../common';
import PlayerDetailModal from '../shared/PlayerDetailModal';

// ─── fixed canvas geometry (not project-specific) ────────────────────────────
const W   = 900;
const H   = 820;
const PAD = { top: 28, right: 24, bottom: 44, left: 24 };
const INNER_W  = W - PAD.left - PAD.right;
const INNER_H  = H - PAD.top  - PAD.bottom;
const CENTER_Y = PAD.top + INNER_H / 2;
const R        = 6;
const DOT_PAD  = 1;
const STEP     = 2 * R + DOT_PAD * 2;
const MIN_DIST_SQ = STEP ** 2;

function computeBeeswarm(players, xOf) {
  const sorted = [...players].sort((a, b) => a.score - b.score);
  const placed = [];
  for (const p of sorted) {
    const cx = xOf(p.score);
    let cy = CENTER_Y;
    for (let offset = 0; offset <= 400; offset += STEP) {
      const candidates = offset === 0 ? [CENTER_Y] : [CENTER_Y - offset, CENTER_Y + offset];
      let settled = false;
      for (const candidate of candidates) {
        let collides = false;
        for (const q of placed) {
          const dx = cx - q.cx;
          const dy = candidate - q.cy;
          if (dx * dx + dy * dy < MIN_DIST_SQ) { collides = true; break; }
        }
        if (!collides) { cy = candidate; settled = true; break; }
      }
      if (settled) break;
    }
    placed.push({ ...p, cx, cy });
  }
  return placed;
}

export default function OverviewSection({ playerMap, activeSeason, navSlot }) {
  const { dataSource, vizConfig, text } = useProjectConfig();
  const { scoreColumn, pitchCountColumn } = dataSource;
  const { leagueAverage, pageSize, colorBands } = vizConfig;

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const effectivePageSize = isMobile ? Math.ceil(pageSize / 2) : pageSize;

  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(0);
  const [sortAsc,    setSortAsc]    = useState(false);
  const [minPitches, setMinPitches] = useState(0);
  const [hovered,    setHovered]    = useState(null);
  const [selected,   setSelected]   = useState(null);

  useEffect(() => { setMinPitches(0); setPage(0); }, [activeSeason]);
  useEffect(() => { setPage(0); }, [effectivePageSize]);

  const rawPlayers = useMemo(() => {
    const rows = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        rows.push({ csvName, score: entry.overall, pitches: entry.totalPitches, entry });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) rows.push({ csvName, score: row[scoreColumn], pitches: row[pitchCountColumn], entry });
      }
    }
    return rows;
  }, [playerMap, activeSeason, scoreColumn, pitchCountColumn]);

  const scoreMin = useMemo(() => {
    if (rawPlayers.length === 0) return 0;
    return Math.floor(Math.min(...rawPlayers.map(p => p.score)) / 10) * 10;
  }, [rawPlayers]);

  const scoreMax = useMemo(() => {
    if (rawPlayers.length === 0) return 200;
    return Math.ceil(Math.max(...rawPlayers.map(p => p.score)) / 10) * 10;
  }, [rawPlayers]);

  const xOf = useMemo(
    () => (score) => PAD.left + ((score - scoreMin) / (scoreMax - scoreMin)) * INNER_W,
    [scoreMin, scoreMax]
  );

  const xTicks = useMemo(() => {
    const ticks = [];
    for (let v = scoreMin; v <= scoreMax; v += 10) ticks.push(v);
    return ticks;
  }, [scoreMin, scoreMax]);

  const chartBands = useMemo(() => {
    const sorted = [...colorBands].sort((a, b) => a.min - b.min);
    return sorted.map((band, i) => ({
      min:  band.min === 0 ? scoreMin : band.min,
      max:  i < sorted.length - 1 ? sorted[i + 1].min : scoreMax,
      fill: band.hex,
    }));
  }, [colorBands, scoreMin, scoreMax]);

  const bandLines = useMemo(
    () => colorBands.map(b => b.min).filter(m => m > scoreMin && m < scoreMax),
    [colorBands, scoreMin, scoreMax]
  );

  const allPlayers = useMemo(() => {
    return rawPlayers
      .filter(p => p.pitches >= minPitches)
      .sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
  }, [rawPlayers, minPitches, sortAsc]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allPlayers;
    const q = search.toLowerCase();
    return allPlayers.filter(({ csvName }) => formatPlayerName(csvName).toLowerCase().includes(q));
  }, [allPlayers, search]);

  const pitchMax = useMemo(() => {
    let max = 0;
    for (const [, entry] of playerMap) {
      const p = activeSeason === 'overall'
        ? entry.totalPitches
        : entry.byYear[activeSeason]?.[pitchCountColumn] ?? 0;
      if (p > max) max = p;
    }
    return Math.ceil(max / 500) * 500;
  }, [playerMap, activeSeason, pitchCountColumn]);

  const dots        = useMemo(() => computeBeeswarm(allPlayers, xOf), [allPlayers, xOf]);
  const searchMatchSet = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(allPlayers.filter(p => formatPlayerName(p.csvName).toLowerCase().includes(q)).map(p => p.csvName));
  }, [allPlayers, search]);

  const refX      = useMemo(() => xOf(leagueAverage), [xOf, leagueAverage]);
  const pageCount  = Math.ceil(filtered.length / effectivePageSize);
  const pageItems  = filtered.slice(page * effectivePageSize, (page + 1) * effectivePageSize);

  const resetPage        = () => setPage(0);
  const handleSearch     = (e) => { setSearch(e.target.value); resetPage(); };
  const handleMinPitch   = (v)  => { setMinPitches(v); resetPage(); };
  const handleSortToggle = ()   => { setSortAsc(v => !v); resetPage(); };

  return (
    <>
      <div className="lg:flex lg:gap-6 lg:h-[85vh]">
      <div className="min-w-0 overflow-hidden lg:flex lg:flex-col" style={{ flex: '7 0 0' }}>

        {navSlot && <div className="mb-4 lg:flex-shrink-0">{navSlot}</div>}

        <div className="flex flex-wrap items-center gap-3 mb-4 lg:flex-shrink-0">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-white placeholder-steel-400/50 focus:outline-none focus:border-steel-500 focus:ring-1 focus:ring-steel-500/30 transition-all"
            />
          </div>
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 border border-navy-600 hover:border-steel-500 hover:text-white text-steel-400 rounded-lg text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortAsc
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m5 4l4-4 4 4" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m5 0l4 4 4-4" />
              }
            </svg>
            {sortAsc ? 'Low → High' : 'High → Low'}
          </button>
          <div className="flex-1 min-w-[180px] bg-navy-800/60 border border-navy-600 rounded-lg px-3 py-2">
            <PitchSlider value={minPitches} onChange={handleMinPitch} max={pitchMax} />
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-600 rounded-2xl p-2 overflow-x-auto lg:flex-1" style={{ minHeight: 0 }}>
          <div className="min-w-[560px] aspect-[900/820] lg:aspect-auto lg:h-full">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" onMouseLeave={() => setHovered(null)}>
              {chartBands.map(({ min, max, fill }) => (
                <rect key={min} x={xOf(min)} y={PAD.top} width={xOf(max) - xOf(min)} height={INNER_H} fill={fill} fillOpacity={0.045} />
              ))}
              {bandLines.map(v => (
                <line key={v} x1={xOf(v)} x2={xOf(v)} y1={PAD.top} y2={PAD.top + INNER_H} stroke="#243656" strokeWidth={1} />
              ))}
              <line x1={PAD.left} x2={W - PAD.right} y1={CENTER_Y} y2={CENTER_Y} stroke="#1e2f48" strokeWidth={1} />
              <line x1={refX} x2={refX} y1={PAD.top} y2={PAD.top + INNER_H} stroke="#4e82c0" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="5 4" />
              <text x={refX} y={PAD.top - 8} fill="#7aaad4" fontSize={10} textAnchor="middle">avg</text>
              {xTicks.map(v => (
                <g key={v}>
                  <line x1={xOf(v)} x2={xOf(v)} y1={PAD.top + INNER_H} y2={PAD.top + INNER_H + 5} stroke="#243656" strokeWidth={1} />
                  <text x={xOf(v)} y={PAD.top + INNER_H + 18} fill="#4e82c0" fillOpacity={0.55} fontSize={10} textAnchor="middle">{v}</text>
                </g>
              ))}
              {dots.map((d) => {
                const isHov    = hovered?.csvName === d.csvName;
                const inSearch = searchMatchSet ? searchMatchSet.has(d.csvName) : true;
                const dimmed   = (hovered && !isHov) || (searchMatchSet && !inSearch);
                return (
                  <circle
                    key={d.csvName}
                    cx={d.cx} cy={d.cy}
                    r={isHov ? R + 2 : R}
                    fill={scoreStroke(d.score, colorBands)}
                    fillOpacity={dimmed ? 0.15 : 0.9}
                    stroke={isHov ? '#ffffff' : inSearch && searchMatchSet ? scoreStroke(d.score, colorBands) : 'transparent'}
                    strokeWidth={isHov ? 1.5 : 1}
                    style={{ cursor: 'pointer', transition: 'r 0.08s, fill-opacity 0.12s' }}
                    onMouseEnter={() => setHovered(d)}
                    onClick={() => setSelected({ csvName: d.csvName, entry: d.entry })}
                  />
                );
              })}
              {hovered && (() => {
                const name = formatPlayerName(hovered.csvName);
                const bW = 140, bH = 54, bR = 6;
                let bX = hovered.cx - bW / 2;
                bX = Math.max(PAD.left, Math.min(bX, W - PAD.right - bW));
                const bY = hovered.cy - bH - 12 >= PAD.top ? hovered.cy - bH - 12 : hovered.cy + 14;
                return (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={bX} y={bY} width={bW} height={bH} rx={bR} fill="#0f1923" stroke="#243656" strokeWidth={1} />
                    <text x={bX + bW / 2} y={bY + 16} fill="#e5e7eb" fontSize={11} textAnchor="middle" fontWeight="500">{name}</text>
                    <text x={bX + bW / 2} y={bY + 34} fill={scoreStroke(hovered.score, colorBands)} fontSize={15} fontWeight="bold" textAnchor="middle">{hovered.score.toFixed(1)}</text>
                    <text x={bX + bW / 2} y={bY + 48} fill="#4e82c0" fontSize={10} textAnchor="middle">{hovered.pitches.toLocaleString()} pitches</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

      </div>

      <div className="mt-6 lg:mt-0 min-w-0 overflow-hidden lg:flex lg:flex-col" style={{ flex: '3 0 0' }}>
        <div className="bg-navy-800 border border-navy-600 rounded-2xl overflow-hidden mb-4 lg:mb-0 lg:flex lg:flex-col" style={{ flex: '1 1 0', minHeight: 0 }}>
          <div className="flex items-center gap-3 px-3 py-2 border-b border-navy-600 text-xs font-semibold text-steel-400 uppercase tracking-wider flex-shrink-0">
            <span className="w-7 text-right flex-shrink-0">#</span>
            <span className="w-8 flex-shrink-0" />
            <span className="flex-1">{text.entityLabel.charAt(0).toUpperCase() + text.entityLabel.slice(1)}</span>
            <span className="w-14 text-right flex-shrink-0">{text.metricAbbrev ?? text.metricLabel}</span>
          </div>

          {pageItems.length === 0 ? (
            <div className="py-12 text-center text-steel-400 text-sm">No {text.entityLabel}s match these filters.</div>
          ) : (
            <div className="divide-y divide-navy-700/60" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
              {pageItems.map(({ csvName, score, entry }, i) => (
                <button
                  key={csvName}
                  onClick={() => setSelected({ csvName, entry })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-navy-700/40 transition-colors text-left group"
                >
                  <span className="w-7 text-right flex-shrink-0 text-xs font-mono text-steel-400">{page * effectivePageSize + i + 1}</span>
                  <PlayerAvatar csvName={csvName} style={{ width: 34, height: 45 }} className="rounded flex-shrink-0" />
                  <span className="flex-1 text-sm text-white font-medium truncate group-hover:text-steel-300 transition-colors">{formatPlayerName(csvName)}</span>
                  <span className={`w-14 text-right flex-shrink-0 text-sm font-bold font-mono tabular-nums ${scoreColor(score, colorBands)}`}>{score.toFixed(1)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-steel-400 mt-3 flex-shrink-0">
          <span>
            {filtered.length === 0
              ? 'No results'
              : `${page * effectivePageSize + 1}–${Math.min((page + 1) * effectivePageSize, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed">← Prev</button>
            <span className="text-white">{page + 1} / {Math.max(pageCount, 1)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pageCount - 1} className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed">Next →</button>
          </div>
        </div>
      </div>

      </div>

      <PlayerDetailModal csvName={selected?.csvName} entry={selected?.entry} onClose={() => setSelected(null)} />
    </>
  );
}
