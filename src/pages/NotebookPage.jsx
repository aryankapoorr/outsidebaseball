import { Link } from 'react-router-dom';
import { SiteHeader, SiteFooter } from '../components/common';
import { ProjectProvider } from '../contexts/ProjectContext';

export default function NotebookPage({ project }) {
  const Section = project.notebookSection;

  return (
    <ProjectProvider config={project}>
      <div className="min-h-screen bg-navy-900 flex flex-col">
        <SiteHeader />

        <div className="border-b border-ob-red/30 bg-navy-800/40">
          <div className="container max-w-4xl py-8">
            <div className="flex items-center gap-3 mb-4">
              <Link
                to="/"
                className="text-xs text-steel-500 hover:text-steel-300 transition-colors inline-flex items-center gap-1"
              >
                ← Home
              </Link>
              <span className="text-steel-700 text-xs">/</span>
              <Link
                to={`/${project.slug}`}
                className="text-xs text-steel-500 hover:text-steel-300 transition-colors inline-flex items-center gap-1"
              >
                {project.name}
              </Link>
            </div>
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
