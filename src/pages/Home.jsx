import { SiteHeader, SiteFooter, PageMinimap } from '../components/common';
import { PROJECTS } from '../data/projects';
import HeroSection from '../components/home/HeroSection';

const MINIMAP_SECTIONS = [
  { id: 'hero', label: 'Home', abbrev: '⌂', iconSrc: '/outsidebaseball.png' },
  ...PROJECTS.map(p => ({ id: p.slug, label: p.name, abbrev: p.text?.metricAbbrev ?? p.name })),
];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />
      <main className="flex-1 pb-4">
        <div id="hero">
          <HeroSection />
        </div>
        <div id="projects">
          {PROJECTS.map((project) => {
            const Preview = project.previewComponent;
            return (
              <div key={project.slug} id={project.slug}>
                <Preview project={project} />
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
      <PageMinimap sections={MINIMAP_SECTIONS} />
    </div>
  );
}
