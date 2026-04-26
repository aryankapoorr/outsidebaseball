import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleBackground, PlayerAvatar } from '../components/common';
import { formatPlayerName } from '../utils/mlbLookup';

const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://aryankapoor.com';

// ── Constants ────────────────────────────────────────────────────────────────

const SEASONS = [2023, 2024, 2025];
const PAGE_SIZE = 25;

const STAT_GROUPS = [
  {
    label: 'Walk Rates After Adversity',
    note: 'lower = better composure',
    keys: [
      ['walk_after_barrel',    'After Barrel'],
      ['walk_after_hard_hit',  'After Hard Hit'],
      ['walk_after_high_xba',  'After High xBA'],
      ['walk_after_walk',      'After Walk'],
    ],
  },
  {
    label: 'First-Pitch Strike Rate',
    note: 'higher = better composure',
    keys: [
      ['first_ball_after_barrel',    'After Barrel'],
      ['first_ball_after_hard_hit',  'After Hard Hit'],
      ['first_ball_after_high_xba',  'After High xBA'],
      ['first_ball_after_soft_hit',  'After Soft Contact'],
      ['first_ball_after_low_xba',   'After Low xBA'],
    ],
  },
  {
    label: 'Other Outcomes',
    keys: [
      ['walk_after_soft_hit',   'Walk% After Soft Contact'],
      ['walk_after_low_xba',    'Walk% After Low xBA'],
      ['hard_hit_after_walk',   'Hard Hit% After Walk'],
      ['hard_hit_after_soft',   'Hard Hit% After Soft Contact'],
      ['ball_after_foul',       'Ball% After Foul'],
    ],
  },
];

// ── Data helpers ─────────────────────────────────────────────────────────────

async function loadAllData() {
  const results = {};
  await Promise.all(
    SEASONS.map(async (yr) => {
      const res  = await fetch(`/data/composure_scores_${yr}.csv`);
      const text = await res.text();
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
      results[yr] = data;
    })
  );
  return results;
}

function buildPlayerMap(allData) {
  const map = new Map(); // csvName → { byYear, years, overall, totalPitches }
  for (const yr of SEASONS) {
    for (const row of allData[yr] ?? []) {
      const name = row.pitcher_name;
      if (!name) continue;
      if (!map.has(name)) map.set(name, { byYear: {} });
      map.get(name).byYear[yr] = row;
    }
  }
  for (const [, entry] of map) {
    const years = Object.keys(entry.byYear).map(Number).sort();
    let totalPitches = 0, weightedScore = 0;
    for (const yr of years) {
      totalPitches  += entry.byYear[yr].pitch_count;
      weightedScore += entry.byYear[yr].composure_plus * entry.byYear[yr].pitch_count;
    }
    entry.years        = years;
    entry.overall      = totalPitches > 0 ? weightedScore / totalPitches : 0;
    entry.totalPitches = totalPitches;
  }
  return map;
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function scoreColor(val) {
  if (val >= 130) return 'text-green-400';
  if (val >= 110) return 'text-cyan-400';
  if (val >= 90)  return 'text-gray-200';
  if (val >= 70)  return 'text-orange-400';
  return 'text-red-400';
}

function scoreStroke(val) {
  if (val >= 130) return '#4ade80';
  if (val >= 110) return '#22d3ee';
  if (val >= 90)  return '#e5e7eb';
  if (val >= 70)  return '#fb923c';
  return '#f87171';
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BaseballComposure() {
  const [allData,        setAllData]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeSeason,   setActiveSeason]   = useState('overall');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(0);

  useEffect(() => {
    loadAllData().then((data) => { setAllData(data); setLoading(false); });
  }, []);

  const playerMap = useMemo(
    () => (allData ? buildPlayerMap(allData) : new Map()),
    [allData]
  );

  const leaderboard = useMemo(() => {
    const rows = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        rows.push({ csvName, score: entry.overall, pitches: entry.totalPitches });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) rows.push({ csvName, score: row.composure_plus, pitches: row.pitch_count });
      }
    }
    return rows.sort((a, b) => b.score - a.score);
  }, [playerMap, activeSeason]);

  const filtered = useMemo(() => {
    if (!search.trim()) return leaderboard;
    const q = search.toLowerCase();
    return leaderboard.filter(({ csvName }) =>
      formatPlayerName(csvName).toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const changeSeason = (s) => { setActiveSeason(s); setPage(0); setSearch(''); };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ── Header ── */}
      <header className="bg-gray-800/90 backdrop-blur-sm shadow-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <a
              href={PORTFOLIO_URL}
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Portfolio
            </a>
            <div className="flex items-center gap-3">
              <span className="text-xl">⚾</span>
              <h1 className="text-lg sm:text-xl font-semibold text-white">Outside Baseball</h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      {!selectedPlayer && (
        <section className="relative bg-gray-900 overflow-hidden py-10 sm:py-14">
          <BubbleBackground sectionId="baseball-hero" bubbleCount={14} colorTheme="blue" intensity="medium" className="z-0" />
          <div className="relative z-10 container text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                Pitcher{' '}
                <span className="text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text">
                  Composure
                </span>{' '}
                Rankings
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
                How well do pitchers maintain their approach after adversity?
                Ranked by Composure+, scaled to a league-average of 100.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Main content ── */}
      <section className="bg-gray-900 pb-16 pt-2">
        <div className="container max-w-2xl">
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.22 }}
              >
                <PlayerDetail
                  csvName={selectedPlayer}
                  entry={playerMap.get(selectedPlayer)}
                  onBack={() => setSelectedPlayer(null)}
                />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  {/* Season tabs */}
                  <div className="flex gap-1 bg-gray-800/60 rounded-xl p-1 border border-gray-700/50">
                    {['overall', ...SEASONS].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSeason(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                          activeSeason === s
                            ? 'bg-green-500/20 text-green-400 border border-green-400/40'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-56">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search pitcher…"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                      className="w-full pl-9 pr-4 py-2 bg-gray-800/70 border border-gray-700/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* List */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
                      {pageItems.map(({ csvName, score }, i) => (
                        <button
                          key={csvName}
                          onClick={() => setSelectedPlayer(csvName)}
                          className={`w-full flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-700/40 text-left
                            ${i % 2 === 0 ? 'bg-gray-900/60' : 'bg-gray-900/30'}
                            ${i < pageItems.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                        >
                          <span className="w-7 text-right text-gray-500 font-mono text-sm flex-shrink-0">
                            {page * PAGE_SIZE + i + 1}
                          </span>
                          <PlayerAvatar csvName={csvName} />
                          <span className="flex-1 font-medium text-white text-sm truncate">
                            {formatPlayerName(csvName)}
                          </span>
                          <span className={`font-bold font-mono text-lg tabular-nums ${scoreColor(score)}`}>
                            {score.toFixed(1)}
                          </span>
                          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                      <span>
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => p - 1)}
                          disabled={page === 0}
                          className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 disabled:opacity-30 hover:text-white transition-all disabled:cursor-not-allowed"
                        >
                          ← Prev
                        </button>
                        <span className="text-gray-300">{page + 1} / {pageCount}</span>
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= pageCount - 1}
                          className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 disabled:opacity-30 hover:text-white transition-all disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Methodology */}
                <div className="mt-14 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">
                    <span className="text-green-400 mr-2">📐</span>How Composure+ is Calculated
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Methodology description coming soon.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="bg-black text-white py-6 border-t border-gray-800">
        <div className="container">
          <p className="text-center text-xs sm:text-sm text-gray-400">
            © 2026 Aryan Kapoor ·{' '}
            <a href={PORTFOLIO_URL} className="hover:text-cyan-400 transition-colors">Portfolio</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Custom SVG chart ──────────────────────────────────────────────────────────

function ComposureChart({ data, lineColor }) {
  const [tooltip, setTooltip] = useState(null);

  const W = 520, H = 180;
  const PAD = { top: 16, right: 28, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const scores = data.map((d) => d.score);
  const rawMin = Math.min(...scores);
  const rawMax = Math.max(...scores);
  const domainMin = Math.max(0, Math.floor(Math.min(rawMin, 100) * 0.92));
  const domainMax = Math.ceil(Math.max(rawMax, 100) * 1.05);
  const domainRange = domainMax - domainMin;

  const xOf = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yOf = (v) => PAD.top  + (1 - (v - domainMin) / domainRange) * innerH;

  const polyline = data.map((d, i) => `${xOf(i)},${yOf(d.score)}`).join(' ');
  const refY = yOf(100);

  const tickStep = Math.ceil(domainRange / 4 / 10) * 10;
  const yTicks = [];
  for (let v = Math.ceil(domainMin / tickStep) * tickStep; v <= domainMax; v += tickStep) {
    yTicks.push(v);
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map((v) => (
          <line key={v} x1={PAD.left} x2={W - PAD.right} y1={yOf(v)} y2={yOf(v)} stroke="#374151" strokeWidth={1} />
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={refY} y2={refY} stroke="#4b5563" strokeWidth={1} strokeDasharray="5 4" />
        <text x={W - PAD.right + 4} y={refY + 4} fill="#6b7280" fontSize={10}>avg</text>
        {yTicks.map((v) => (
          <text key={v} x={PAD.left - 6} y={yOf(v) + 4} fill="#6b7280" fontSize={11} textAnchor="end">{v}</text>
        ))}
        {data.map((d, i) => (
          <text key={d.year} x={xOf(i)} y={H - PAD.bottom + 16} fill="#9ca3af" fontSize={12} textAnchor="middle">{d.year}</text>
        ))}
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.year} onMouseEnter={() => setTooltip({ i, d })}>
            <circle cx={xOf(i)} cy={yOf(d.score)} r={tooltip?.i === i ? 7 : 5} fill={lineColor} stroke="#111827" strokeWidth={2} style={{ transition: 'r 0.1s' }} />
            <circle cx={xOf(i)} cy={yOf(d.score)} r={16} fill="transparent" />
          </g>
        ))}
        {tooltip && (() => {
          const cx = xOf(tooltip.i);
          const cy = yOf(tooltip.d.score);
          const bW = 82, bH = 36, bR = 6;
          const bX = Math.min(cx - bW / 2, W - PAD.right - bW);
          const bY = cy - bH - 10;
          return (
            <g>
              <rect x={bX} y={bY} width={bW} height={bH} rx={bR} fill="#111827" stroke="#374151" strokeWidth={1} />
              <text x={bX + bW / 2} y={bY + 13} fill="#9ca3af" fontSize={10} textAnchor="middle">{tooltip.d.year}</text>
              <text x={bX + bW / 2} y={bY + 27} fill={lineColor} fontSize={13} fontWeight="bold" textAnchor="middle">{tooltip.d.score.toFixed(1)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Player detail ─────────────────────────────────────────────────────────────

function PlayerDetail({ csvName, entry, onBack }) {
  const { byYear, years, overall, totalPitches } = entry;
  const [detailYear, setDetailYear] = useState(years[years.length - 1]);

  const yearRow   = byYear[detailYear];
  const chartData = years.map((yr) => ({
    year:  String(yr),
    score: parseFloat(byYear[yr].composure_plus.toFixed(1)),
  }));

  const dotColor = scoreStroke(overall);

  return (
    <div className="pt-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Rankings
      </button>

      <div className="flex items-center gap-5 mb-8">
        <PlayerAvatar csvName={csvName} style={{ width: 72, height: 96 }} />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {formatPlayerName(csvName)}
          </h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono tabular-nums ${scoreColor(overall)}`}>
              {overall.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">Overall Composure+</span>
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            {years.length} season{years.length !== 1 ? 's' : ''} · {totalPitches.toLocaleString()} total pitches
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Composure+ Year over Year
        </p>
        <ComposureChart data={chartData} lineColor={dotColor} />
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setDetailYear(yr)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  detailYear === yr
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
          <div className="text-right">
            <span className={`text-xl font-bold font-mono tabular-nums ${scoreColor(yearRow.composure_plus)}`}>
              {yearRow.composure_plus.toFixed(1)}
            </span>
            <p className="text-gray-500 text-xs">{yearRow.pitch_count.toLocaleString()} pitches</p>
          </div>
        </div>

        {STAT_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </span>
              {group.note && (
                <span className="text-xs text-gray-600">· {group.note}</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.keys.map(([key, label]) => {
                const val = yearRow[key];
                if (val == null) return null;
                return (
                  <div key={key} className="bg-gray-900/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 mb-0.5 truncate">{label}</p>
                    <p className="font-mono text-sm font-medium text-gray-200">
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
  );
}
