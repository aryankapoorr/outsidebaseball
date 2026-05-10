import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SiteHeader, SiteFooter, TabBar, SeasonSelector, ProjectPageHeader } from '../components/common';
import { ProjectProvider } from '../contexts/ProjectContext';
import { createProjectService } from '../services/projectService';

export default function ProjectPage({ project }) {
  const service = useMemo(() => createProjectService(project), [project.slug]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [allData,      setAllData]      = useState(null);
  const [seasons,      setSeasons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeSeason, setActiveSeason] = useState('overall');

  // First non-scrollTarget section is the default tab
  const defaultTab = project.sections.find(s => !s.scrollTarget)?.id ?? project.sections[0].id;
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Ref so we can read the intended scroll target inside effects without
  // triggering extra re-renders
  const scrollTargetRef = useRef(null);

  useEffect(() => {
    service.fetchAllSeasons().then((data) => {
      setAllData(data);
      setSeasons(data.seasons ?? []);
      setLoading(false);
    });
  }, [service]);

  // Read ?tab= once on mount; decide tab-switch vs. scroll-target
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;
    const section = project.sections.find(s => s.id === tab);
    if (section?.scrollTarget) scrollTargetRef.current = tab;
    else if (section) setActiveTab(tab);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once data is loaded AND a scroll target is queued, scroll after the next
  // layout pass (rAF fires after the browser has committed and painted the sections)
  useEffect(() => {
    if (loading || !scrollTargetRef.current) return;
    const target = scrollTargetRef.current;
    scrollTargetRef.current = null;
    requestAnimationFrame(() => {
      document.getElementById(`${target}-section`)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [loading]);

  const playerMap = useMemo(
    () => (allData ? service.buildPlayerMap(allData) : new Map()),
    [allData, service]
  );

  const handleTabChange = (id) => {
    const section = project.sections.find(s => s.id === id);
    if (section?.scrollTarget) {
      setActiveTab(defaultTab);
      setSearchParams({ tab: id }, { replace: true });
      // rAF fires after React commits the re-render that makes the section visible
      requestAnimationFrame(() => {
        document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      setActiveTab(id);
      setSearchParams(id === defaultTab ? {} : { tab: id }, { replace: true });
    }
  };

  const tabs = project.sections.map(s => ({ id: s.id, label: s.label }));

  const navSlot = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <TabBar tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      <SeasonSelector activeSeason={activeSeason} onChange={setActiveSeason} seasons={seasons} />
    </div>
  );

  return (
    <ProjectProvider config={project}>
      <div className="min-h-screen bg-navy-900 flex flex-col">
        <SiteHeader />

        <ProjectPageHeader
          name={project.name}
          description={`${project.text.tagline} ${project.text.pageDescription}`}
          slug={project.slug}
          notebookPath={project.text.notebookPath}
        />

        <section className="flex-1 pb-16 pt-6">
          <div className="container max-w-6xl">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-steel-500/30 border-t-steel-500 rounded-full animate-spin" />
              </div>
            ) : (
              project.sections.map((s) => {
                if (s.scrollTarget) {
                  if (activeTab !== defaultTab) return null;
                  const Section = s.component;
                  return <Section key={s.id} />;
                }
                if (s.id !== activeTab) return null;
                const Section = s.component;
                return (
                  <Section
                    key={s.id}
                    playerMap={playerMap}
                    activeSeason={activeSeason}
                    navSlot={navSlot}
                  />
                );
              })
            )}
          </div>
        </section>

        <SiteFooter />
      </div>
    </ProjectProvider>
  );
}
