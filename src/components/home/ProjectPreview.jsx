import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SeasonSelector } from '../common';
import { ProjectProvider } from '../../contexts/ProjectContext';
import { createProjectService } from '../../services/projectService';
import OverviewSection from '../sections/OverviewSection';

export default function ProjectPreview({ project }) {
  const service = useMemo(() => createProjectService(project), [project.slug]);

  const [allData,      setAllData]      = useState(null);
  const [seasons,      setSeasons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeSeason, setActiveSeason] = useState('overall');

  useEffect(() => {
    service.fetchAllSeasons().then((data) => {
      setAllData(data);
      setSeasons(data.seasons ?? []);
      setLoading(false);
    });
  }, [service]);

  const playerMap = useMemo(
    () => (allData ? service.buildPlayerMap(allData) : new Map()),
    [allData, service]
  );

  const navSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex gap-1 bg-navy-800/60 rounded-xl p-1 border border-navy-600">
        <Link
          to={`/${project.slug}?tab=leaderboard`}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-steel-400 hover:text-white hover:bg-navy-700/50 transition-all"
        >
          Leaderboard
        </Link>
        <Link
          to={`/${project.slug}?tab=methodology`}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-steel-400 hover:text-white hover:bg-navy-700/50 transition-all"
        >
          Methodology
        </Link>
      </div>
      <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} seasons={seasons} />
    </div>
  );

  return (
    <ProjectProvider config={project}>
      <div className="pb-16">
        <div className="border-b border-navy-600 bg-navy-800/40">
          <div className="container max-w-6xl py-8">
            <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Metric</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{project.name}</h1>
                <p className="text-steel-400 text-sm sm:text-base max-w-xl">
                  {project.text.tagline} {project.text.pageDescription}
                </p>
              </div>
              <Link
                to={`/${project.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-steel-500 hover:bg-steel-400 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0"
              >
                Explore Metric
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
            <OverviewSection
              playerMap={playerMap}
              activeSeason={activeSeason}
              navSlot={navSlot}
            />
          )}
        </div>
      </div>
    </ProjectProvider>
  );
}
