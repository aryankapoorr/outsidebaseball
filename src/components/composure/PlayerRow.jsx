import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAvatar } from '../common';
import { formatPlayerName } from '../../utils/mlbLookup';
import { scoreColor, scoreStroke } from '../../utils/scoreUtils';
import PlayerDetailExpanded from './PlayerDetailExpanded';

export default function PlayerRow({ csvName, score, rank, entry, isExpanded, onToggle }) {
  const pct = Math.min(score / 200, 1);

  return (
    <div className="border-b border-navy-600/50 last:border-b-0">
      {/* Row */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 px-5 py-3 transition-colors text-left
          ${isExpanded ? 'bg-navy-700/60' : 'hover:bg-navy-700/40'}
          ${rank % 2 === 1 ? 'bg-navy-800/60' : 'bg-navy-800/30'}`}
      >
        <span className="w-7 text-right text-steel-400 font-mono text-sm flex-shrink-0">{rank}</span>
        <PlayerAvatar csvName={csvName} />
        <span className="flex-1 font-medium text-white text-sm truncate">
          {formatPlayerName(csvName)}
        </span>

        {/* Score bar + number */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-20 h-1.5 bg-navy-600 rounded-full hidden sm:block">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${pct * 100}%`, backgroundColor: scoreStroke(score) }}
            />
            {/* League avg tick at 50% */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-steel-400/60"
              style={{ left: '50%' }}
            />
          </div>
          <span className={`font-bold font-mono text-base tabular-nums w-14 text-right ${scoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-steel-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Accordion detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <PlayerDetailExpanded csvName={csvName} entry={entry} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
