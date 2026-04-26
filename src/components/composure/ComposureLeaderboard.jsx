import { useState, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { PAGE_SIZE } from '../../services/composureService';
import PlayerRow from './PlayerRow';

const MIN_PITCHES_OPTIONS = [
  { label: 'All', value: 0 },
  { label: '200+', value: 200 },
  { label: '500+', value: 500 },
  { label: '1000+', value: 1000 },
  { label: '2000+', value: 2000 },
];

export default function ComposureLeaderboard({ playerMap, activeSeason }) {
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortAsc,     setSortAsc]     = useState(false);
  const [minPitches,  setMinPitches]  = useState(0);

  const leaderboard = useMemo(() => {
    const rows = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        rows.push({ csvName, score: entry.overall, pitches: entry.totalPitches, entry });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) rows.push({ csvName, score: row.composure_plus, pitches: row.pitch_count, entry });
      }
    }
    return rows.sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
  }, [playerMap, activeSeason, sortAsc]);

  const filtered = useMemo(() => {
    let result = leaderboard;
    if (minPitches > 0) result = result.filter(r => r.pitches >= minPitches);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(({ csvName }) => formatPlayerName(csvName).toLowerCase().includes(q));
    }
    return result;
  }, [leaderboard, search, minPitches]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => { setPage(0); setExpandedRow(null); };
  const handleSearch    = (e) => { setSearch(e.target.value); resetPage(); };
  const handleMinPitch  = (v)  => { setMinPitches(v); resetPage(); };
  const handleSortAsc   = ()   => { setSortAsc(v => !v); resetPage(); };
  const handleToggle    = (csvName) => setExpandedRow((prev) => (prev === csvName ? null : csvName));

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
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

        {/* Sort direction */}
        <button
          onClick={handleSortAsc}
          title={sortAsc ? 'Showing: Low → High' : 'Showing: High → Low'}
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

        {/* Min pitches */}
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

      {/* List */}
      <div className="rounded-2xl border border-navy-600 overflow-hidden">
        {pageItems.length === 0 ? (
          <div className="py-12 text-center text-steel-400 text-sm">No pitchers match these filters.</div>
        ) : (
          pageItems.map(({ csvName, score, entry }, i) => (
            <PlayerRow
              key={csvName}
              csvName={csvName}
              score={score}
              rank={page * PAGE_SIZE + i + 1}
              entry={entry}
              isExpanded={expandedRow === csvName}
              onToggle={() => handleToggle(csvName)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-steel-400">
        <span>
          {filtered.length === 0
            ? 'No results'
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPage((p) => p - 1); setExpandedRow(null); }}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-white">{page + 1} / {Math.max(pageCount, 1)}</span>
          <button
            onClick={() => { setPage((p) => p + 1); setExpandedRow(null); }}
            disabled={page >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 disabled:opacity-30 hover:text-white hover:border-navy-500 transition-all disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
