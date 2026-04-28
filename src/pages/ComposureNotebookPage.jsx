import { SiteHeader, SiteFooter } from '../components/common';
import NotebookViewer from '../components/composure/NotebookViewer';

export default function ComposureNotebookPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <SiteHeader />

      <div className="border-b border-navy-600 bg-navy-800/40">
        <div className="container max-w-4xl py-8">
          <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-2">Composure+</p>
          <h1 className="text-2xl font-bold text-white">composure.ipynb</h1>
        </div>
      </div>

      <section className="flex-1 pb-16 pt-8">
        <div className="container max-w-4xl">
          <NotebookViewer />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
