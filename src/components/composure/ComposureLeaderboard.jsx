import { useState, useMemo } from 'react';
import { formatPlayerName } from '../../utils/mlbLookup';
import { PAGE_SIZE } from '../../services/composureService';
import PlayerRow from './PlayerRow';

export default function ComposureLeaderboard({ playerMap, activeSeason }) {
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const leaderboard = useMemo(() => {
    const rows = [];
    for (const [csvName, entry] of playerMap) {
      if (activeSeason === 'overall') {
        rows.push({ csvName, score: entry.overall, entry });
      } else {
        const row = entry.byYear[activeSeason];
        if (row) rows.push({ csvName, score: row.composure_plus, entry });
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

  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); setExpandedRow(null); };
  const handleToggle = (csvName) => setExpandedRow((prev) => (prev === csvName ? null : csvName));

  return (
    <div>
      {/* Search */}
      <div className="relative w-full sm:w-64 mb-5">
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

      {/* List */}
      <div className="rounded-2xl border border-navy-600 overflow-hidden">
        {pageItems.map(({ csvName, score, entry }, i) => (
          <PlayerRow
            key={csvName}
            csvName={csvName}
            score={score}
            rank={page * PAGE_SIZE + i + 1}
            entry={entry}
            isExpanded={expandedRow === csvName}
            onToggle={() => handleToggle(csvName)}
          />
        ))}
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
