import { useEffect, useRef, useState, useCallback } from 'react';

export default function PageMinimap({ sections }) {
  const containerRef = useRef(null);

  const [blocks,    setBlocks]    = useState([]);
  const [scrollY,   setScrollY]   = useState(0);
  const [pageH,     setPageH]     = useState(1);
  const [viewportH, setViewportH] = useState(window.innerHeight);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeId,  setActiveId]  = useState(null);
  const [dragging,  setDragging]  = useState(false);

  const recompute = useCallback(() => {
    const ph  = document.documentElement.scrollHeight;
    const vh  = window.innerHeight;
    const sy  = window.scrollY;
    const vpc = sy + vh / 2;

    const newBlocks = sections.map(({ id, label, abbrev, iconSrc }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect    = el.getBoundingClientRect();
      const pageTop = rect.top + sy;
      return { id, label, abbrev, iconSrc, pageTop, pageHeight: rect.height };
    }).filter(Boolean).filter(b => b.pageHeight > 0);

    let active = null;
    for (const b of newBlocks) {
      if (vpc >= b.pageTop && vpc < b.pageTop + b.pageHeight) { active = b.id; break; }
    }

    setBlocks(newBlocks);
    setPageH(ph);
    setScrollY(sy);
    setViewportH(vh);
    setActiveId(active);
  }, [sections]);

  useEffect(() => {
    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    const ro = new ResizeObserver(recompute);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
      ro.disconnect();
    };
  }, [recompute]);

  const scrollToRatio = useCallback((ratio) => {
    window.scrollTo({ top: ratio * pageH - viewportH / 2 });
  }, [pageH, viewportH]);

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) scrollToRatio(Math.max(0, Math.min((e.clientY - rect.top) / rect.height, 1)));
  }, [scrollToRatio]);

  const handlePointerMove = useCallback((e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) scrollToRatio(Math.max(0, Math.min((e.clientY - rect.top) / rect.height, 1)));
  }, [scrollToRatio]);

  const handlePointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  const mmH     = Math.round(viewportH * 0.5);
  const mmRatio = mmH / pageH;

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 hidden lg:block" style={{ width: 32 }}>
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative rounded-lg border border-navy-700/50 bg-navy-900/80 backdrop-blur overflow-hidden"
          style={{ height: mmH, cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          {blocks.map((b, i) => {
            const isActive = b.id === activeId;
            const top    = b.pageTop    * mmRatio;
            const height = b.pageHeight * mmRatio;
            return (
              <div key={b.id} className="absolute w-full" style={{ top, height }}
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="absolute inset-0" style={{
                  background: isActive ? 'rgba(78,130,192,0.15)' : i % 2 === 0 ? 'rgba(22,34,54,0.6)' : 'rgba(14,26,40,0.6)',
                  borderLeft: isActive ? '2px solid rgba(78,130,192,0.8)' : '2px solid transparent',
                }} />
                {height > 14 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    {b.iconSrc ? (
                      <img
                        src={b.iconSrc}
                        alt=""
                        className="rounded-full"
                        style={{
                          width: 14, height: 14,
                          opacity: isActive ? 0.9 : 0.25,
                          filter: isActive ? 'none' : 'grayscale(1)',
                        }}
                      />
                    ) : (
                      <span className="text-[9px] font-bold"
                        style={{ color: isActive ? 'rgba(78,130,192,0.9)' : 'rgba(255,255,255,0.18)' }}>
                        {b.abbrev}
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-navy-700/40" />
                {(hoveredId === b.id || isActive) && (
                  <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none shadow-lg border ${
                    isActive ? 'bg-navy-800 border-steel-500/50 text-white' : 'bg-navy-800 border-navy-600 text-steel-300'
                  }`}>{b.label}</div>
                )}
              </div>
            );
          })}
          <div className="absolute left-0 right-0 pointer-events-none rounded-sm" style={{
            top: scrollY * mmRatio, height: viewportH * mmRatio,
            background: 'rgba(78,130,192,0.12)', border: '1px solid rgba(78,130,192,0.35)',
          }} />
        </div>
    </div>
  );
}
