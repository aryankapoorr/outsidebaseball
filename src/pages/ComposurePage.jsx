import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SiteHeader, SiteFooter, TabBar, SeasonSelector } from '../components/common';
import ComposureLeaderboard from '../components/composure/ComposureLeaderboard';
import ComposureCards from '../components/composure/ComposureCards';
import ComposureNotebook from '../components/composure/ComposureNotebook';
import { fetchAllComposureSeasons, buildPlayerMap } from '../services/composureService';

const TABS = [
  { id: 'overview',    label: 'Overview'    },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'methodology', label: 'Methodology' },
];

export default function ComposurePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allData,              setAllData]              = useState(null);
  const [loading,              setLoading]              = useState(true);
  const [activeTab,            setActiveTab]            = useState('overview');
  const [activeSeason,         setActiveSeason]         = useState('overall');
  const [scrollToMethodology,  setScrollToMethodology]  = useState(false);
  const [pendingScroll,        setPendingScroll]        = useState(false);

  useEffect(() => {
    fetchAllComposureSeasons().then((data) => { setAllData(data); setLoading(false); });
  }, []);

  // Apply ?tab= query param on initial load
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'leaderboard') setActiveTab('leaderboard');
    else if (tab === 'methodology') setPendingScroll(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once data finishes loading, execute any pending methodology scroll
  useEffect(() => {
    if (!loading && pendingScroll) {
      setTimeout(() => {
        document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setPendingScroll(false);
    }
  }, [loading, pendingScroll]);

  // After a render triggered by switching to overview, scroll to the methodology section
  useEffect(() => {
    if (!scrollToMethodology) return;
    document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' });
    setScrollToMethodology(false);
  }, [scrollToMethodology]);

  const playerMap = useMemo(
    () => (allData ? buildPlayerMap(allData) : new Map()),
    [allData]
  );

  const handleTabChange = (id) => {
    if (id === 'methodology') {
      setActiveTab('overview');
      setScrollToMethodology(true);
      setSearchParams({ tab: 'methodology' }, { replace: true });
    } else if (id === 'overview') {
      setActiveTab('overview');
      setSearchParams({}, { replace: true });
    } else {
      setActiveTab(id);
      setSearchParams({ tab: id }, { replace: true });
    }
  };

  const navSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <TabBar tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />
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
            <>
              <ComposureLeaderboard
                playerMap={playerMap}
                activeSeason={activeSeason}
                navSlot={navSlot}
              />
              {/* Methodology — below the chart/table */}
              <div id="methodology-section" className="mt-16 border-t border-navy-600 pt-12">
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Methodology</p>
                <h2 className="text-2xl font-bold text-white mb-2">How Composure+ is built</h2>
                <p className="text-steel-400 text-sm sm:text-base max-w-2xl mb-8">
                  Composure+ measures how pitchers respond to adversity on a pitch-by-pitch basis.
                  It combines 14 conditional rate statistics — each capturing behavior in the immediate
                  pitch or plate appearance after a specific triggering event — then scales to a
                  league-average of 100 so pitchers across seasons can be compared directly.
                </p>
                <ComposureNotebook />
              </div>
            </>
          ) : (
            <ComposureCards
              playerMap={playerMap}
              activeSeason={activeSeason}
              navSlot={navSlot}
            />
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
