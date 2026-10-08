'use client';

import { useEffect, useState } from 'react';
import { subscribeBhajan, playBhajan, stopBhajan } from '@/lib/bhajan';

// Small circular replay control for the header top strip.
// Shows animated bars while playing, a music note otherwise.
export default function BhajanButton() {
  const [s, setS] = useState({ available: false, playing: false });
  useEffect(() => subscribeBhajan(setS), []);
  if (!s.available) return null;

  const toggle = () => {
    if (s.playing) stopBhajan();
    else playBhajan();
  };

  return (
    <button
      data-bhajan-ui
      onClick={toggle}
      title={s.playing ? 'Stop devotional music' : 'Replay devotional music'}
      aria-label={s.playing ? 'Stop devotional music' : 'Replay devotional music'}
      className="w-7 h-7 rounded-full bg-white/10 border border-sacred-diya/60 text-sacred-diya flex items-center justify-center hover:bg-sacred-diya hover:text-sacred-deepmaroon transition shrink-0"
    >
      {s.playing ? (
        <span className="flex items-center gap-[2px]" aria-hidden="true">
          <span className="w-[3px] rounded-full bg-current animate-pulse" style={{ height: 10 }} />
          <span className="w-[3px] rounded-full bg-current animate-pulse" style={{ height: 14, animationDelay: '-0.3s' }} />
          <span className="w-[3px] rounded-full bg-current animate-pulse" style={{ height: 8, animationDelay: '-0.6s' }} />
        </span>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
      )}
    </button>
  );
}
