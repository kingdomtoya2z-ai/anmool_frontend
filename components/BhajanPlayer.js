'use client';

import { useEffect, useRef, useState } from 'react';

// Devotional background audio — starts on the first site open per session,
// like temple websites. Browsers block audible autoplay, so we attempt it and
// fall back to a tap-to-enable pill. Once enabled it keeps playing across pages.
const SRC = process.env.NEXT_PUBLIC_BHAJAN_URL || '/audio/bhajan.mp3';
const SESSION_KEY = 'anmool_bhajan_autostarted';
const MUTE_KEY = 'anmool_bhajan_muted';

export default function BhajanPlayer() {
  const audioRef = useRef(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [muted, setMuted] = useState(false);

  // Only render at all when an audio file actually exists
  useEffect(() => {
    let live = true;
    fetch(SRC, { method: 'HEAD' })
      .then((r) => { if (live && r.ok) setAvailable(true); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  // First open per session → try autoplay
  useEffect(() => {
    if (!available) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch { return; }
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.4;
    let m = false;
    try { m = localStorage.getItem(MUTE_KEY) === '1'; } catch {}
    a.muted = m;
    setMuted(m);
    a.play()
      .then(() => { setPlaying(true); setNeedsTap(false); })
      .catch(() => { setPlaying(false); setNeedsTap(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  const enable = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.muted = false;
      setMuted(false);
      try { localStorage.setItem(MUTE_KEY, '0'); } catch {}
      await a.play();
      setPlaying(true);
      setNeedsTap(false);
    } catch {
      setNeedsTap(true);
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    const m = !muted;
    a.muted = m;
    setMuted(m);
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch {}
    if (!m && a.paused) {
      a.play().then(() => { setPlaying(true); setNeedsTap(false); }).catch(() => setNeedsTap(true));
    }
  };

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="auto" aria-hidden="true" />
      {needsTap || !playing ? (
        <button
          onClick={enable}
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-diya text-xs font-bold shadow-[0_10px_30px_-8px_rgba(20,40,8,0.7)] border border-sacred-diya/50 animate-pulse hover:animate-none hover:scale-105 transition"
          aria-label="Play devotional music"
        >
          <span className="w-7 h-7 rounded-full bg-sacred-diya/20 border border-sacred-diya/60 flex items-center justify-center font-vedic text-base leading-none">ॐ</span>
          Mangal Dhun bajayein
        </button>
      ) : (
        <button
          onClick={toggleMute}
          title={muted ? 'Unmute devotional music' : 'Mute devotional music'}
          aria-label={muted ? 'Unmute devotional music' : 'Mute devotional music'}
          className="fixed bottom-5 right-5 z-[60] w-11 h-11 rounded-full bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-diya shadow-[0_10px_30px_-8px_rgba(20,40,8,0.7)] border border-sacred-diya/50 flex items-center justify-center hover:scale-105 transition"
        >
          {muted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <span className="flex items-center gap-0.5">
              <span className="w-1 rounded-full bg-sacred-diya animate-pulse" style={{ height: 12 }} />
              <span className="w-1 rounded-full bg-sacred-diya animate-pulse" style={{ height: 16, animationDelay: '-0.3s' }} />
              <span className="w-1 rounded-full bg-sacred-diya animate-pulse" style={{ height: 9, animationDelay: '-0.6s' }} />
            </span>
          )}
        </button>
      )}
    </>
  );
}
