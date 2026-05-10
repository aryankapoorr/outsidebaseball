import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE } from '../../data/site';

export default function AboutPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed z-50 bg-navy-800 border border-navy-600 shadow-2xl overflow-y-auto
              inset-x-0 bottom-0 rounded-t-2xl max-h-[70vh]
              sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-96 sm:rounded-2xl sm:max-h-none"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-steel-400 hover:text-white hover:bg-navy-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 pt-5">
              {/* Site identity */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-ob-red/30">
                <img src="/outsidebaseball.png" alt={SITE.name} className="h-10 w-10 rounded-full flex-shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-white">{SITE.name}</h2>
                  <p className="text-xs text-steel-500 mt-0.5">{SITE.tagline}</p>
                </div>
              </div>

              {/* About */}
              <div className="mb-6 pb-6 border-b border-ob-red/30">
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-3">About</p>
                {SITE.about.map((para, i) => (
                  <p key={i} className={`text-sm text-steel-300 leading-relaxed ${i > 0 ? 'mt-3' : ''} ${para.italic ? 'italic' : ''}`}>
                    {para.text}
                  </p>
                ))}
              </div>

              {/* Built by */}
              <div>
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-widest mb-3">Built by</p>
                <a
                  href={SITE.author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 border border-navy-600 hover:border-steel-500 hover:text-white text-steel-300 text-sm font-medium transition-all w-full justify-between group"
                >
                  {SITE.author.name}
                  <svg className="w-4 h-4 text-steel-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
