import { Link } from 'react-router-dom';
import { STAT_GROUPS } from '../../services/composureService';
import NotebookViewer from './NotebookViewer';

export default function ComposureNotebook() {
  return (
    <div>
      {/* Notebook viewer */}
      <div className="rounded-2xl border border-gray-700/50 overflow-hidden mb-8">
        <div className="bg-gray-800/60 px-5 py-3 border-b border-gray-700/50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">composure.ipynb</p>
          <Link
            to="/composure/notebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Open full notebook ↗
          </Link>
        </div>
        <NotebookViewer scrollable />
      </div>

      {/* Metric glossary */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-5">Component Metrics</h3>
        {STAT_GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white">{group.label}</span>
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
