import { useState, useEffect, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { PAGE_SIZE } from '../../services/composureService';
import { PitchSlider } from '../common';
import PlayerCard from './PlayerCard';
import PlayerDetailModal from './PlayerDetailModal';

export default function ComposureCards({ playerMap, activeSeason, navSlot }) {
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(0);
  const [sortAsc,    setSortAsc]    = useState(false);
  const [minPitches, setMinPitches] = useState(0);
  const [selected,   setSelected]   = useState(null);

  useEffect(() => {
    setMinPitches(0);
    setPage(0);
  }, [activeSeason]);

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
      .filter(p => p.pitches >= minPitches)
      .sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
  }, [playerMap, activeSeason, minPitches, sortAsc]);

  const pitchMax = useMemo(() => {
    let max = 0;
    for (const [, entry] of playerMap) {
      const p = activeSeason === 'overall'
        ? entry.totalPitches
        : entry.byYear[activeSeason]?.pitch_count ?? 0;
      if (p > max) max = p;
    }
    return Math.ceil(max / 500) * 500;
  }, [playerMap, activeSeason]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allPlayers;
    const q = search.toLowerCase();
    return allPlayers.filter(({ csvName }) => formatPlayerName(csvName).toLowerCase().includes(q));
  }, [allPlayers, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);
  const handleSearch     = (e) => { setSearch(e.target.value); resetPage(); };
  const handleMinPitch   = (v)  => { setMinPitches(v); resetPage(); };
  const handleSortToggle = ()   => { setSortAsc(v => !v); resetPage(); };

  return (
    <>
      {navSlot && <div className="mb-6">{navSlot}</div>}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        <div className="flex-1 min-w-[180px] bg-navy-800/60 border border-navy-600 rounded-lg px-3 py-2">
          <PitchSlider value={minPitches} onChange={handleMinPitch} max={pitchMax} />
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-steel-400 text-sm">No pitchers match these filters.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
          {pageItems.map(({ csvName, score, entry }, i) => (
            <PlayerCard
              key={csvName}
              csvName={csvName}
              score={score}
              rank={page * PAGE_SIZE + i + 1}
              onClick={() => setSelected({ csvName, entry })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-steel-400">
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

      <PlayerDetailModal
        csvName={selected?.csvName}
        entry={selected?.entry}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
