import { useState, useEffect, useMemo } from 'react';
import { SiteHeader, SiteFooter, TabBar, SeasonSelector } from '../components/common';
import ComposureLeaderboard from '../components/composure/ComposureLeaderboard';
import ComposureCards from '../components/composure/ComposureCards';
import ComposureNotebook from '../components/composure/ComposureNotebook';
import { fetchAllComposureSeasons, buildPlayerMap } from '../services/composureService';

const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'leaderboard',  label: 'Leaderboard'  },
  { id: 'methodology',  label: 'Methodology'  },
];

export default function ComposurePage() {
  const [allData,      setAllData]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('overview');
  const [activeSeason, setActiveSeason] = useState('overall');

  useEffect(() => {
    fetchAllComposureSeasons().then((data) => { setAllData(data); setLoading(false); });
  }, []);

  const playerMap = useMemo(
    () => (allData ? buildPlayerMap(allData) : new Map()),
    [allData]
  );

  // navSlot for Overview: tab bar + season selector sit inside the left column
  const overviewNavSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} />
    </div>
  );

  // navSlot for Leaderboard: tab bar + season selector above the card grid
  const leaderboardNavSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} />
    </div>
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-steel-500/30 border-t-steel-500 rounded-full animate-spin" />
            </div>
          ) : activeTab === 'overview' ? (
            <ComposureLeaderboard
              playerMap={playerMap}
              activeSeason={activeSeason}
              navSlot={overviewNavSlot}
            />
          ) : activeTab === 'leaderboard' ? (
            <ComposureCards
              playerMap={playerMap}
              activeSeason={activeSeason}
              navSlot={leaderboardNavSlot}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
              </div>
              <ComposureNotebook />
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
