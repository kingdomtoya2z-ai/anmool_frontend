'use client';

import { useEffect } from 'react';
import { ensureAudio, playBhajan, isBhajanStopped } from '@/lib/bhajan';

export default function BhajanPlayer() {
  useEffect(() => {
    ensureAudio();
    if (isBhajanStopped()) return;

    const attempt = () => {
      playBhajan().catch(() => {});
    };

    attempt();
    // Try again on common user gestures as a fallback (browsers allow after first interaction)
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    const unlock = () => {
      attempt();
      events.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
    };
    events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
    };
  }, []);

  return null;
}
