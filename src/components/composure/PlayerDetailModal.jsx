import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerDetailExpanded from './PlayerDetailExpanded';

export default function PlayerDetailModal({ csvName, entry, onClose }) {
  const open = !!(csvName && entry);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* Panel — slides up from bottom on mobile, from right on desktop */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed z-50 bg-navy-800 border border-navy-600 shadow-2xl overflow-y-auto
              inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]
              sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[460px] sm:rounded-2xl sm:max-h-none"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-steel-400 hover:text-white hover:bg-navy-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <PlayerDetailExpanded csvName={csvName} entry={entry} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
