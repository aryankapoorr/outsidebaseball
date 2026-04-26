/**
 * Reusable tab navigation bar.
 * tabs: Array<{ id: string, label: string }>
 */
export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-navy-800/60 rounded-xl p-1 border border-navy-600">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-navy-700 text-white border border-navy-500'
              : 'text-steel-400 hover:text-white hover:bg-navy-700/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
