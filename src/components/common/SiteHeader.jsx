import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PROJECTS } from '../../data/projects';
import AboutPanel from './AboutPanel';

const NAV_LINKS = PROJECTS.map(p => ({ label: p.navLabel, to: `/${p.slug}` }));

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-navy-600">
        <div className="container max-w-6xl flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img
              src="/outsidebaseball.png"
              alt="Outside Baseball"
              className="h-8 w-8 rounded-full"
            />
            <span className="font-semibold text-white text-sm tracking-wide hidden xs:block">
              Outside Baseball
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ label, to }) => {
              const active = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-navy-700 text-white'
                      : 'text-steel-400 hover:text-white hover:bg-navy-700/50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => setAboutOpen(true)}
              className="ml-1 px-3 py-1.5 rounded-md text-sm font-medium text-steel-400 hover:text-white hover:bg-navy-700/50 transition-all"
            >
              About
            </button>
          </nav>
        </div>
      </header>

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
