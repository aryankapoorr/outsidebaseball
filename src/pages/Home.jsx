import { useState, useEffect, useMemo } from 'react';
import { SiteHeader, SiteFooter } from '../components/common';
import ComposurePreview from '../components/home/ComposurePreview';
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

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-steel-500/30 border-t-steel-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ComposurePreview
            playerMap={playerMap}
            activeSeason={activeSeason}
            onSeasonChange={setActiveSeason}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
