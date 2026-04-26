import { STAT_GROUPS } from '../../services/composureService';

export default function StatGroupGrid({ yearRow }) {
  return (
    <div>
      {STAT_GROUPS.map((group) => (
        <div key={group.label} className="mb-5 last:mb-0">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider">
              {group.label}
            </span>
            {group.note && (
              <span className="text-xs text-steel-400 opacity-50">· {group.note}</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.keys.map(([key, label]) => {
              const val = yearRow[key];
              if (val == null) return null;
              return (
                <div key={key} className="bg-navy-950/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-steel-400 opacity-70 mb-0.5 truncate">{label}</p>
                  <p className="font-mono text-sm font-medium text-white">
                    {(val * 100).toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
