import { STAT_GROUPS } from '../../services/composureService';

export default function ComposureNotebook() {
  return (
    <div>
      {/* Notebook iframe */}
      <div className="rounded-2xl border border-gray-700/50 overflow-hidden mb-8">
        <div className="bg-gray-800/60 px-5 py-3 border-b border-gray-700/50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">composure.ipynb</p>
          <a
            href="https://github.com/aryankapoorr/baseball/blob/main/composure/composure.ipynb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View on GitHub ↗
          </a>
        </div>
        <iframe
          src="/notebooks/composure.html"
          sandbox="allow-scripts"
          loading="lazy"
          title="Composure+ Notebook"
          className="w-full bg-gray-950"
          style={{ minHeight: 640, border: 'none' }}
        />
      </div>

      {/* Metric glossary */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-1">Component Metrics</h3>
        <p className="text-gray-400 text-sm mb-5">
          Composure+ is built from 14 conditional rate statistics. Each measures how a pitcher behaves
          in the pitch or plate appearance immediately following a specific triggering event.
        </p>
        {STAT_GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white">{group.label}</span>
              {group.note && <span className="text-xs text-gray-500">· {group.note}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.keys.map(([key, label]) => (
                <div key={key} className="bg-gray-900/60 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-green-400/70 flex-shrink-0">{key}</span>
                  <span className="text-gray-400 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
