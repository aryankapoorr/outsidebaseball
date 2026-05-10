import { SITE } from '../../data/site';

export default function SiteFooter() {
  return (
    <footer className="bg-navy-950 border-t border-ob-red/30 py-8">
      <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-steel-500">© 2026 {SITE.name}</p>
        <a
          href={SITE.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 border border-navy-600 hover:border-steel-500 hover:text-white text-steel-300 text-sm font-medium transition-all"
        >
          Built by {SITE.author.name}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
