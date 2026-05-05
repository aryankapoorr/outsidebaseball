import { Link } from 'react-router-dom';

export default function ProjectPageHeader({ name, description, slug, showCta = false }) {
  return (
    <div className="border-b border-navy-600 bg-navy-800/40">
      <div className="container max-w-6xl py-8">
        <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Metric</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{name}</h1>
            <p className="text-steel-400 text-sm sm:text-base max-w-xl">{description}</p>
          </div>
          {showCta && (
            <Link
              to={`/${slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-steel-500 hover:bg-steel-400 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0"
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
  );
}
