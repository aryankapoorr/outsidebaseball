import { Link } from 'react-router-dom';
import { SiteHeader, SiteFooter } from '../components/common';
import { ProjectProvider } from '../contexts/ProjectContext';

export default function NotebookPage({ project }) {
  const Section = project.notebookSection;

  return (
    <ProjectProvider config={project}>
      <div className="min-h-screen bg-navy-900 flex flex-col">
        <SiteHeader />

        <div className="border-b border-navy-600 bg-navy-800/40">
          <div className="container max-w-4xl py-8">
            <Link
              to={`/${project.slug}`}
              className="text-xs text-steel-500 hover:text-steel-300 transition-colors mb-4 inline-flex items-center gap-1"
            >
              ← Back to {project.name}
            </Link>
            <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">{project.name}</p>
            <h1 className="text-2xl font-bold text-white">{project.text.notebookFilename}</h1>
          </div>
        </div>

        <section className="flex-1 pb-16 pt-8">
          <div className="container max-w-4xl">
            <Section />
          </div>
        </section>

        <SiteFooter />
      </div>
    </ProjectProvider>
  );
}
