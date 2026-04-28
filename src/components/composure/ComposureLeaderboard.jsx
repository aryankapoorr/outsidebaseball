import { useState, useEffect, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreStroke, scoreColor } from '../../utils/scoreUtils';
import { PAGE_SIZE } from '../../services/composureService';
import { PlayerAvatar } from '../common';
import PlayerDetailModal from './PlayerDetailModal';

// ─── beeswarm constants ───────────────────────────────────────────────────────
const W = 900;
const H = 820;
const PAD = { top: 28, right: 24, bottom: 44, left: 24 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const CENTER_Y = PAD.top + INNER_H / 2;
const SCORE_MIN = 50;
const SCORE_MAX = 160;
const R = 6;
const DOT_PAD = 1;
const STEP = 2 * R + DOT_PAD * 2;
const MIN_DIST_SQ = STEP ** 2;

const BANDS = [
  { min: 50,  max: 70,  fill: '#f87171' },
  { min: 70,  max: 90,  fill: '#fb923c' },
  { min: 90,  max: 110, fill: '#e5e7eb' },
  { min: 110, max: 130, fill: '#22d3ee' },
  { min: 130, max: 160, fill: '#4ade80' },
];


const X_TICKS = [];
for (let v = 50; v <= 160; v += 10) X_TICKS.push(v);

const MIN_PITCHES_OPTIONS = [
  { label: 'All',   value: 0    },
  { label: '2000+', value: 2000 },
  { label: '1000+', value: 1000 },
  { label: '500+',  value: 500  },
];

function xOf(score) {
  return PAD.left + ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * INNER_W;
}

function computeBeeswarm(players) {
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

// ─── component ────────────────────────────────────────────────────────────────
export default function ComposureLeaderboard({ playerMap, activeSeason, navSlot }) {
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(0);
  const [sortAsc,    setSortAsc]    = useState(false);
  const [minPitches, setMinPitches] = useState(0);
  const [hovered,    setHovered]    = useState(null);
  const [selected,   setSelected]   = useState(null);

  useEffect(() => {
    setMinPitches(0);
    setPage(0);
  }, [activeSeason]);

  // All players for the selected season + min-pitches threshold (feeds both chart and cards)
  const allPlayers = useMemo(() => {
    const rows = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        rows.push({ csvName, score: entry.overall, pitches: entry.totalPitches, entry });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) rows.push({ csvName, score: row.composure_plus, pitches: row.pitch_count, entry });
      }
    }
    return rows
      .filter(p => p.pitches >= minPitches && p.score >= SCORE_MIN && p.score <= SCORE_MAX)
      .sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
  }, [playerMap, activeSeason, minPitches, sortAsc]);

  // Card grid: additionally filtered by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return allPlayers;
    const q = search.toLowerCase();
    return allPlayers.filter(({ csvName }) => formatPlayerName(csvName).toLowerCase().includes(q));
  }, [allPlayers, search]);

  const dots = useMemo(() => computeBeeswarm(allPlayers), [allPlayers]);

  // Set of names matching the current search (used to highlight dots)
  const searchMatchSet = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(allPlayers.filter(p => formatPlayerName(p.csvName).toLowerCase().includes(q)).map(p => p.csvName));
  }, [allPlayers, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const refX = xOf(100);

  const resetPage = () => setPage(0);
  const handleSearch     = (e) => { setSearch(e.target.value); resetPage(); };
  const handleMinPitch   = (v)  => { setMinPitches(v); resetPage(); };
  const handleSortToggle = ()   => { setSortAsc(v => !v); resetPage(); };

  return (
    <>
      {/* ── two-column: 75% chart / 25% table, fixed height so rows match chart ── */}
      <div className="lg:flex lg:gap-6 lg:h-[85vh]">
      {/* — left column: filter bar + chart + legend ——————————————————————————— */}
      <div className="min-w-0 lg:flex lg:flex-col" style={{ flex: '3 1 0%' }}>

        {/* Nav slot: tab bar + season selector from parent */}
        {navSlot && (
          <div className="mb-4 lg:flex-shrink-0">{navSlot}</div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4 lg:flex-shrink-0">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search pitcher…"
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
          <div className="flex items-center gap-1 bg-navy-800/60 border border-navy-600 rounded-lg p-1">
            <span className="text-xs text-steel-400 px-2 whitespace-nowrap">Min pitches</span>
            {MIN_PITCHES_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleMinPitch(value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  minPitches === value
                    ? 'bg-navy-700 text-white border border-navy-500'
                    : 'text-steel-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart — fills remaining left-column height on desktop */}
        <div
          className="bg-navy-800 border border-navy-600 rounded-2xl p-2 overflow-x-auto lg:flex-1"
          style={{ minHeight: 0 }}
        >
          <div className="min-w-[560px] aspect-[900/820] lg:aspect-auto lg:h-full">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHovered(null)}
            >
              {BANDS.map(({ min, max, fill }) => (
                <rect key={min} x={xOf(min)} y={PAD.top} width={xOf(max) - xOf(min)} height={INNER_H} fill={fill} fillOpacity={0.045} />
              ))}
              {[70, 90, 110, 130].map(v => (
                <line key={v} x1={xOf(v)} x2={xOf(v)} y1={PAD.top} y2={PAD.top + INNER_H} stroke="#243656" strokeWidth={1} />
              ))}
              <line x1={PAD.left} x2={W - PAD.right} y1={CENTER_Y} y2={CENTER_Y} stroke="#1e2f48" strokeWidth={1} />
              <line x1={refX} x2={refX} y1={PAD.top} y2={PAD.top + INNER_H} stroke="#4e82c0" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="5 4" />
              <text x={refX} y={PAD.top - 8} fill="#7aaad4" fontSize={10} textAnchor="middle">avg</text>
              {X_TICKS.map(v => (
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
                    fill={scoreStroke(d.score)}
                    fillOpacity={dimmed ? 0.15 : 0.9}
                    stroke={isHov ? '#ffffff' : inSearch && searchMatchSet ? scoreStroke(d.score) : 'transparent'}
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
                    <text x={bX + bW / 2} y={bY + 34} fill={scoreStroke(hovered.score)} fontSize={15} fontWeight="bold" textAnchor="middle">{hovered.score.toFixed(1)}</text>
                    <text x={bX + bW / 2} y={bY + 48} fill="#4e82c0" fontSize={10} textAnchor="middle">{hovered.pitches.toLocaleString()} pitches</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

      </div>{/* end left column */}

      {/* — right column: table + pagination ————————————————————————————————— */}
      <div
        className="mt-6 lg:mt-0 lg:flex lg:flex-col"
        style={{ flex: '1 1 0%' }}
      >
        {/* Table card — fixed height equal to chart column on desktop */}
        <div
          className="bg-navy-800 border border-navy-600 rounded-2xl overflow-hidden mb-4 lg:mb-0 lg:flex lg:flex-col"
          style={{ flex: '1 1 0', minHeight: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-navy-600 text-xs font-semibold text-steel-400 uppercase tracking-wider flex-shrink-0">
            <span className="w-7 text-right flex-shrink-0">#</span>
            <span className="w-8 flex-shrink-0" />
            <span className="flex-1">Pitcher</span>
            <span className="w-14 text-right flex-shrink-0">C+</span>
          </div>

          {pageItems.length === 0 ? (
            <div className="py-12 text-center text-steel-400 text-sm">No pitchers match these filters.</div>
          ) : (
            <div className="divide-y divide-navy-700/60" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
              {pageItems.map(({ csvName, score, entry }, i) => (
                <button
                  key={csvName}
                  onClick={() => setSelected({ csvName, entry })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-navy-700/40 transition-colors text-left group"
                >
                  <span className="w-7 text-right flex-shrink-0 text-xs font-mono text-steel-400">
                    {page * PAGE_SIZE + i + 1}
                  </span>
                  <PlayerAvatar csvName={csvName} style={{ width: 34, height: 45 }} className="rounded flex-shrink-0" />
                  <span className="flex-1 text-sm text-white font-medium truncate group-hover:text-steel-300 transition-colors">
                    {formatPlayerName(csvName)}
                  </span>
                  <span className={`w-14 text-right flex-shrink-0 text-sm font-bold font-mono tabular-nums ${scoreColor(score)}`}>
                    {score.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-steel-400 mt-3 flex-shrink-0">
          <span>
            {filtered.length === 0
              ? 'No results'
              : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="text-white">{page + 1} / {Math.max(pageCount, 1)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pageCount - 1}
              className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>{/* end right column */}

      </div>{/* end two-column wrapper */}

      <PlayerDetailModal
        csvName={selected?.csvName}
        entry={selected?.entry}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
