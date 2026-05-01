import { Link, useLocation } from 'react-router-dom';
import { PROJECTS } from '../../data/projects';

const NAV_LINKS = PROJECTS.map(p => ({ label: p.navLabel, to: `/${p.slug}` }));

export default function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur border-b border-navy-600">
      <div className="container max-w-6xl flex items-center justify-between h-14">
        {/* Logo + wordmark */}
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

        {/* Nav links */}
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
        </nav>
      </div>
    </header>
  );
}
