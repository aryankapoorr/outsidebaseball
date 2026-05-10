import { useProjectConfig } from '../../contexts/ProjectContext';
import NotebookViewer from '../shared/NotebookViewer';

export default function NotebookSection() {
  const { text } = useProjectConfig();

  return (
    <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="bg-gray-800/60 px-5 py-3 border-b border-gray-700/50">
        <p className="text-sm font-medium text-gray-300">{text.notebookFilename}</p>
      </div>
      <NotebookViewer floatingNav />
    </div>
  );
}
