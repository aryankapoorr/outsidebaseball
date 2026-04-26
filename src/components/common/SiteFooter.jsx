const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://aryankapoor.com';

export default function SiteFooter() {
  return (
    <footer className="bg-navy-950 border-t border-navy-600 py-6">
      <div className="container max-w-6xl">
        <p className="text-center text-xs text-steel-400">
          © 2026 Aryan Kapoor ·{' '}
          <a href={PORTFOLIO_URL} className="hover:text-white transition-colors">
            Portfolio
          </a>
        </p>
      </div>
    </footer>
  );
}
