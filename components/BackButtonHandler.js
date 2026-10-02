'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';

/**
 * Native Android back-button routing.
 * - If the WebView has history (previous screen) -> go back to it.
 * - If at the entry screen (no history) -> exit the app.
 * No-op on web builds (listener never fires in a normal browser).
 */
export default function BackButtonHandler() {
  useEffect(() => {
    let listener = null;
    let cancelled = false;
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    }).then((l) => {
      if (cancelled) l.remove();
      else listener = l;
    });
    return () => {
      cancelled = true;
      if (listener) listener.remove();
    };
  }, []);

  return null;
}
