import { useState, useRef } from 'react';

export default function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const ref                   = useRef(null);

  function show() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.top, left: rect.left + rect.width / 2 });
    setVisible(true);
  }

  return (
    <span ref={ref} className="inline-flex items-center" onMouseEnter={show} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div
          style={{
            position:  'fixed',
            top:       pos.top,
            left:      pos.left,
            transform: 'translate(-50%, calc(-100% - 8px))',
            zIndex:    9999,
          }}
          className="whitespace-nowrap bg-navy-900 border border-navy-600 rounded-md px-2 py-1 text-xs text-steel-300 shadow-xl pointer-events-none"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-600" />
        </div>
      )}
    </span>
  );
}
