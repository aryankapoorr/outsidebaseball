import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProjectConfig } from '../../contexts/ProjectContext';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const md = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-7 mb-3 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-white mt-6 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-200 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 text-sm leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-300 text-sm mb-3 space-y-1 pl-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-300 text-sm mb-3 space-y-1 pl-2">{children}</ol>
  ),
  li: ({ children }) => <li className="text-gray-300 text-sm">{children}</li>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
  hr: () => <hr className="border-gray-700 my-5" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-600 pl-4 text-gray-400 italic mb-3">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    return isBlock ? (
      <code className="text-gray-300 text-xs font-mono">{children}</code>
    ) : (
      <code className="bg-gray-800 text-green-400 text-xs px-1.5 py-0.5 rounded font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 rounded-lg p-4 mb-3 overflow-x-auto text-xs border border-gray-700/50">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-gray-700/50">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left text-gray-300 font-semibold px-3 py-2 border border-gray-700/50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-gray-400 px-3 py-2 border border-gray-700/50">{children}</td>
  ),
};

function CellOutputs({ outputs }) {
  if (!outputs?.length) return null;
  return (
    <div className="mb-4 space-y-2">
      {outputs.map((out, i) => {
        if (out.output_type === 'display_data' || out.output_type === 'execute_result') {
          if (out.data?.['image/png']) {
            return (
              <img
                key={i}
                src={`data:image/png;base64,${out.data['image/png']}`}
                alt="cell output"
                className="max-w-full rounded-lg border border-gray-700/50"
              />
            );
          }
          if (out.data?.['text/html']) {
            const html = Array.isArray(out.data['text/html'])
              ? out.data['text/html'].join('')
              : out.data['text/html'];
            return (
              <div
                key={i}
                className="overflow-x-auto text-xs text-gray-300 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-gray-800 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-gray-700/50 [&_td]:px-3 [&_td]:py-1.5 [&_td]:border [&_td]:border-gray-700/50 [&_tr:nth-child(even)]:bg-gray-800/40"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
        }
        if (out.output_type === 'stream') {
          const text = Array.isArray(out.text) ? out.text.join('') : out.text;
          if (!text?.trim()) return null;
          return (
            <pre key={i} className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
              {text}
            </pre>
          );
        }
        return null;
      })}
    </div>
  );
}

function NotebookCell({ cell, sectionId }) {
  const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

  if (cell.cell_type === 'markdown') {
    if (!source.trim()) return null;
    return (
      <div id={sectionId} className={`mb-2 ${sectionId ? 'scroll-mt-20' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
          {source}
        </ReactMarkdown>
      </div>
    );
  }

  if (cell.cell_type === 'code') {
    return (
      <div id={sectionId} className={sectionId ? 'scroll-mt-20' : ''}>
        {source.trim() && (
          <pre className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4 mb-2 overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed">
            <code>{source}</code>
          </pre>
        )}
        <CellOutputs outputs={cell.outputs} />
      </div>
    );
  }

  return null;
}

function FloatingNav({ sections }) {
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // Close mobile panel on outside click
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (!panelRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  }

  return createPortal(
    <>
      {/* Desktop: fixed sidebar */}
      <nav className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-0.5 z-50 max-w-[180px]">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5 px-2">Sections</p>
        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs text-left transition-colors ${
                active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                active ? 'bg-cyan-400' : 'bg-gray-700'
              }`} />
              <span className="truncate">{s.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile: FAB + popover */}
      <div ref={panelRef} className="xl:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="bg-navy-800 border border-navy-600 rounded-xl shadow-xl overflow-hidden">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-4 pt-3 pb-1.5">Sections</p>
            {sections.map((s) => {
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2 text-xs transition-colors ${
                    active ? 'text-white bg-navy-700' : 'text-gray-400 hover:text-white hover:bg-navy-700/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-cyan-400' : 'bg-gray-600'}`} />
                  {s.title}
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-10 h-10 rounded-full bg-navy-700 border border-navy-500 text-white flex items-center justify-center shadow-lg hover:bg-navy-600 transition-colors"
          aria-label="Jump to section"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      </div>
    </>,
    document.body
  );
}

export default function NotebookViewer({ scrollable = false, floatingNav = false }) {
  const { dataSource } = useProjectConfig();
  const [cells, setCells] = useState(null);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(dataSource.notebookUrl)
      .then((r) => r.json())
      .then((nb) => setCells(nb.cells))
      .catch(() => setError(true));
  }, []);

  const sections = useMemo(() => {
    if (!cells) return [];
    return cells.flatMap((cell, i) => {
      if (cell.cell_type !== 'markdown') return [];
      const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      const match = src.match(/^## (.+)/m);
      if (!match) return [];
      return [{ cellIndex: i, title: match[1].trim(), id: slugify(match[1].trim()) }];
    });
  }, [cells]);

  const sectionIdMap = useMemo(() => {
    const map = {};
    for (const s of sections) map[s.cellIndex] = s.id;
    return map;
  }, [sections]);

  function scrollToSection(id) {
    const container = scrollRef.current;
    const el = document.getElementById(id);
    if (!el) return;
    if (scrollable && container) {
      container.scrollTo({ top: el.offsetTop - container.offsetTop - 8, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (error) {
    return (
      <p className="text-red-400 text-sm text-center py-8">
        Failed to load notebook.
      </p>
    );
  }

  if (!cells) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800 rounded h-4" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Inline nav strip — shown when not using floating nav */}
      {!floatingNav && sections.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-gray-700/50 scrollbar-hide flex-shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        className={`px-6 py-5 ${scrollable ? 'overflow-y-auto' : ''}`}
        style={scrollable ? { maxHeight: 680 } : undefined}
      >
        {cells.map((cell, i) => (
          <NotebookCell key={i} cell={cell} sectionId={sectionIdMap[i]} />
        ))}
      </div>

      {floatingNav && sections.length > 0 && <FloatingNav sections={sections} />}
    </div>
  );
}
