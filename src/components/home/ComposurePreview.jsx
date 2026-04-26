import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SeasonSelector } from '../common';
import PlayerCard from '../composure/PlayerCard';
import PlayerDetailModal from '../composure/PlayerDetailModal';

const PREVIEW_COUNT = 10;

export default function ComposurePreview({ playerMap, activeSeason, onSeasonChange }) {
  const [selected, setSelected] = useState(null); // { csvName, entry }

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

  return (
    <>
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

          {/* Card grid — top 10 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
            {leaderboard.map(({ csvName, score, entry }, i) => (
              <PlayerCard
                key={csvName}
                csvName={csvName}
                score={score}
                rank={i + 1}
                onClick={() => setSelected({ csvName, entry })}
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

      {/* Detail modal — shared with card grid */}
      <PlayerDetailModal
        csvName={selected?.csvName}
        entry={selected?.entry}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
