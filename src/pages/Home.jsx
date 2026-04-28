import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader, SiteFooter, SeasonSelector } from '../components/common';
import ComposureLeaderboard from '../components/composure/ComposureLeaderboard';
import { fetchAllComposureSeasons, buildPlayerMap } from '../services/composureService';

export default function Home() {
  const [allData,      setAllData]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeSeason, setActiveSeason] = useState('overall');

  useEffect(() => {
    fetchAllComposureSeasons().then((data) => { setAllData(data); setLoading(false); });
  }, []);

  const playerMap = useMemo(
    () => (allData ? buildPlayerMap(allData) : new Map()),
    [allData]
  );

  const navSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} />
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />

      <main className="flex-1 pb-16">
        {/* Section header */}
        <div className="border-b border-navy-600 bg-navy-800/40">
          <div className="container max-w-6xl py-8">
            <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Project</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Composure+</h1>
                <p className="text-steel-400 text-sm sm:text-base max-w-xl">
                  How well do pitchers maintain their approach after adversity?
                  Ranked by Composure+, scaled to a league-average of 100.
                </p>
              </div>
              <Link
                to="/composure"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-steel-500 hover:bg-steel-400 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0"
              >
                Explore Project
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-steel-500/30 border-t-steel-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ComposureLeaderboard
              playerMap={playerMap}
              activeSeason={activeSeason}
              navSlot={navSlot}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
