import { SiteHeader, SiteFooter } from '../components/common';
import { PROJECTS } from '../data/projects';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />
      <main className="flex-1 pb-16">
        {PROJECTS.map((project) => {
          const Preview = project.previewComponent;
          return <Preview key={project.slug} project={project} />;
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
