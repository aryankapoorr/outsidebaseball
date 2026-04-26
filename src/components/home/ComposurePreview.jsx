import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SeasonSelector } from '../common';
import PlayerRow from '../composure/PlayerRow';

const PREVIEW_COUNT = 10;

export default function ComposurePreview({ playerMap, activeSeason, onSeasonChange }) {
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
    return rows.sort((a, b) => b.score - a.score).slice(0, PREVIEW_COUNT);
  }, [playerMap, activeSeason]);

  const handleToggle = (csvName) =>
    setExpandedRow((prev) => (prev === csvName ? null : csvName));

  return (
    <section className="py-12">
      <div className="container max-w-6xl">
        {/* Section label */}
        <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-1">Project</p>

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <Link to="/composure" className="hover:text-steel-400 transition-colors">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Composure+</h2>
            </Link>
            <p className="text-steel-400 text-sm sm:text-base max-w-lg">
              How well do pitchers maintain their approach after adversity?
              Ranked by Composure+, scaled to a league-average of 100.
            </p>
          </div>
          <SeasonSelector activeSeason={activeSeason} onChange={onSeasonChange} />
        </div>

        {/* Preview leaderboard */}
        <div className="rounded-2xl border border-navy-600 overflow-hidden mb-5">
          {leaderboard.map(({ csvName, score, entry }, i) => (
            <PlayerRow
              key={csvName}
              csvName={csvName}
              score={score}
              rank={i + 1}
              entry={entry}
              isExpanded={expandedRow === csvName}
              onToggle={() => handleToggle(csvName)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <Link
            to="/composure"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 border border-navy-600 hover:border-steel-500 text-steel-400 hover:text-white rounded-xl text-sm font-medium transition-all"
          >
            Full Rankings & Breakdown
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
