import { Link } from 'react-router-dom';

export default function ProjectPageHeader({ name, description, slug, notebookPath, showCta = false }) {
  return (
    <div className="border-b border-ob-red/30 bg-navy-800/40">
      <div className="container max-w-6xl py-8">
        <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Metric</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{name}</h1>
            <p className="text-steel-400 text-sm sm:text-base max-w-xl">{description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {notebookPath && (
              <Link
                to={notebookPath}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-steel-500/60 hover:border-steel-500 text-steel-400 hover:text-white rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Notebook
              </Link>
            )}
            {showCta && (
              <Link
                to={`/${slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-steel-500 hover:bg-steel-400 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Explore Metric
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
