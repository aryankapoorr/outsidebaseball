import { useState, useEffect, useMemo } from 'react';
import { SiteHeader, SiteFooter, TabBar, SeasonSelector } from '../components/common';
import ComposureLeaderboard from '../components/composure/ComposureLeaderboard';
import ComposureNotebook from '../components/composure/ComposureNotebook';
import { fetchAllComposureSeasons, buildPlayerMap } from '../services/composureService';

const TABS = [
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'methodology', label: 'Methodology' },
];

export default function ComposurePage() {
  const [allData,      setAllData]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('leaderboard');
  const [activeSeason, setActiveSeason] = useState('overall');

  useEffect(() => {
    fetchAllComposureSeasons().then((data) => { setAllData(data); setLoading(false); });
  }, []);

  const playerMap = useMemo(
    () => (allData ? buildPlayerMap(allData) : new Map()),
    [allData]
  );

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />

      {/* Page header */}
      <div className="border-b border-navy-600 bg-navy-800/40">
        <div className="container max-w-6xl py-8">
          <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Project</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Composure+</h1>
          <p className="text-steel-400 text-sm sm:text-base max-w-xl">
            How well do pitchers maintain their approach after adversity?
            Ranked by Composure+, scaled to a league-average of 100.
          </p>
        </div>
      </div>

      {/* Main content */}
      <section className="flex-1 pb-16 pt-6">
        <div className="container max-w-6xl">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            {activeTab !== 'methodology' && (
              <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} />
            )}
          </div>

          {/* Tab content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-steel-500/30 border-t-steel-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'leaderboard' && (
                <ComposureLeaderboard playerMap={playerMap} activeSeason={activeSeason} />
              )}
              {activeTab === 'methodology' && (
                <ComposureNotebook />
              )}
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
