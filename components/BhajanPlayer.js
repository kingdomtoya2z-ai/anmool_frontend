'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ensureAudio, playBhajan, stopBhajan, getBhajanState, isBhajanStopped } from '@/lib/bhajan';

// Autoplay policy: homepage first entry per session plays once.
// Stops on (a) navigating away, or (b) the first tap anywhere else.
// Manual replay via the header button is always allowed.
const SESSION_KEY = 'anmool_bhajan_session_done';

function sessionDone() {
  try { return !!sessionStorage.getItem(SESSION_KEY); } catch { return true; }
}
function markSessionDone() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
}

export default function BhajanPlayer() {
  const pathname = usePathname();
  const enteredOn = useRef(null);
  // True while we still owe the visitor the session's autostart (browser
  // blocked the silent attempt) — the next tap anywhere starts it, since
  // that tap counts as the user gesture browsers require.
  const pendingUnlock = useRef(false);

  // Mount: audio element ready, probe handled by lib
  useEffect(() => {
    ensureAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Homepage entry (first load or later navigation) → autoplay once per session
  useEffect(() => {
    if (pathname !== '/') {
      if (getBhajanState().playing) stopBhajan();
      enteredOn.current = null;
      return;
    }
    if (sessionDone()) return;
    if (isBhajanStopped()) { markSessionDone(); return; }
    enteredOn.current = '/';
    markSessionDone();
    playBhajan().then((ok) => {
      if (!ok) pendingUnlock.current = true;
    });
  }, [pathname]);

  // Tap anywhere (except the replay button itself):
  //  - if autostart is still owed → this tap unlocks & starts the music
  //  - else if music is playing → stop it
  useEffect(() => {
    const onDown = (e) => {
      try {
        if (e.target && e.target.closest && e.target.closest('[data-bhajan-ui]')) return;
      } catch {}
      if (pendingUnlock.current) {
        pendingUnlock.current = false;
        playBhajan();
        return;
      }      if (getBhajanState().playing) {
        stopBhajan();
        markSessionDone();
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, []);

  return null;
}
