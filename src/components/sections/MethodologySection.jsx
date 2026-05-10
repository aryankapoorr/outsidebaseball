import { Link } from 'react-router-dom';
import { useProjectConfig } from '../../contexts/ProjectContext';
import NotebookViewer from '../shared/NotebookViewer';

export default function MethodologySection() {
  const { text, statGroups } = useProjectConfig();

  return (
    <div id="methodology-section" className="mt-16 border-t border-navy-600 pt-12">
      <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Methodology</p>
      <h2 className="text-2xl font-bold text-white mb-2">{text.methodologyTitle}</h2>
      <p className="text-steel-400 text-sm sm:text-base max-w-2xl mb-8">{text.methodologyBlurb}</p>

      {/* Embedded notebook */}
      <div className="rounded-2xl border border-gray-700/50 overflow-hidden mb-8">
        <div className="bg-gray-800/60 px-5 py-3 border-b border-gray-700/50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">{text.notebookFilename}</p>
          <Link
            to={text.notebookPath}
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
        <h3 className="text-lg font-bold text-white mb-5">{text.componentMetricsTitle}</h3>
        {statGroups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white">{group.label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.keys.map(([key, label]) => (
                <div key={key} className="bg-gray-900/60 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-ob-red-light flex-shrink-0">{key}</span>
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
