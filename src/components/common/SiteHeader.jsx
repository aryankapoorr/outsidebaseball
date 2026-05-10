import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PROJECTS } from '../../data/projects';
import AboutPanel from './AboutPanel';

const NAV_LINKS = PROJECTS.map(p => ({ label: p.navLabel, abbrev: p.text?.metricAbbrev ?? p.navLabel, to: `/${p.slug}` }));

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-ob-red/30">
        <div className="container max-w-6xl flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img
              src="/outsidebaseball.png"
              alt="Outside Baseball"
              className="h-8 w-8 rounded-full"
            />
            <span className="font-semibold text-white text-base tracking-wide hidden xs:block">
              Outside Baseball
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ label, abbrev, to }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-all ${
                    active
                      ? 'text-white underline decoration-ob-red decoration-2 underline-offset-4'
                      : 'text-steel-400 hover:text-white hover:bg-navy-700/50'
                  }`}
                >
                  <span className="sm:hidden">{abbrev}</span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setAboutOpen(true)}
              className="ml-1 px-3 py-1.5 rounded-md text-sm font-medium text-steel-400 hover:text-white hover:bg-navy-700/50 transition-all"
            >
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">About</span>
            </button>
          </nav>
        </div>
      </header>

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
