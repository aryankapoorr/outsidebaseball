import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProjectConfig } from '../../contexts/ProjectContext';

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

function NotebookCell({ cell }) {
  const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
  if (!source.trim()) return null;

  if (cell.cell_type === 'markdown') {
    return (
      <div className="mb-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
          {source}
        </ReactMarkdown>
      </div>
    );
  }

  if (cell.cell_type === 'code') {
    return (
      <pre className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4 mb-4 overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed">
        <code>{source}</code>
      </pre>
    );
  }

  return null;
}

export default function NotebookViewer({ scrollable = false }) {
  const { dataSource } = useProjectConfig();
  const [cells, setCells] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(dataSource.notebookUrl)
      .then((r) => r.json())
      .then((nb) => setCells(nb.cells))
      .catch(() => setError(true));
  }, []);

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
    <div
      className={`px-6 py-5 ${scrollable ? 'overflow-y-auto' : ''}`}
      style={scrollable ? { maxHeight: 680 } : undefined}
    >
      {cells.map((cell, i) => (
        <NotebookCell key={i} cell={cell} />
      ))}
    </div>
  );
}
