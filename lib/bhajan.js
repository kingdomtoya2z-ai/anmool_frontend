// Shared devotional-audio manager (module singleton).
// BhajanPlayer (in layout) owns autoplay/stop policy; BhajanButton (in the
// header top strip) is the small circular replay control. Both drive the
// same <Audio> element so music never overlaps or restarts on navigation.
const SRC = () => process.env.NEXT_PUBLIC_BHAJAN_URL || '/audio/bhajan.mp3';
const STOPPED_KEY = 'anmool_bhajan_stopped';

let audio = null;
const state = { available: false, playing: false };
const listeners = new Set();

function emit() {
  const snap = { ...state };
  listeners.forEach((fn) => { try { fn(snap); } catch {} });
}

export function subscribeBhajan(fn) {
  listeners.add(fn);
  try { fn({ ...state }); } catch {}
  return () => { listeners.delete(fn); };
}

export function getBhajanState() {
  return { ...state };
}

function persistStopped(v) {
  // Session-only: a stop lasts this visit; a fresh session autoplays again.
  try { sessionStorage.setItem(STOPPED_KEY, v ? '1' : '0'); } catch {}
}

export function isBhajanStopped() {
  try { return sessionStorage.getItem(STOPPED_KEY) === '1'; } catch { return false; }
}

export function ensureAudio() {
  if (!audio && typeof Audio !== 'undefined') {
    audio = new Audio(SRC());
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
  }
  return audio;
}

export function probeBhajan() {
  if (typeof window === 'undefined') return;
  fetch(SRC(), { method: 'HEAD' })
    .then((r) => {
      if (r.ok && !state.available) { state.available = true; emit(); }
    })
    .catch(() => {});
}

export async function playBhajan() {
  const a = ensureAudio();
  if (!a) return false;
  try {
    a.muted = false;
    await a.play();
    state.playing = true;
    persistStopped(false);
    emit();
    return true;
  } catch {
    return false;
  }
}

export function stopBhajan() {
  if (audio) { try { audio.pause(); } catch {} }
  if (state.playing) {
    state.playing = false;
    persistStopped(true);
    emit();
  }
}

// Probe once when this module first loads on the client.
if (typeof window !== 'undefined') probeBhajan();
