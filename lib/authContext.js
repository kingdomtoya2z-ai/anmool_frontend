'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { resetExpiryFlag } from './api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Every key this app persists in the browser. Wiped together on logout so no
// trace of a previous session survives on a shared device.
const CLIENT_STATE_KEYS = ['token', 'user', 'cart'];

export function clearClientState() {
  if (typeof window === 'undefined') return;
  CLIENT_STATE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

const readCachedUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

// Only swap in a new object when something actually changed. Without this the
// background token check would hand consumers a brand new `user` object every
// minute and re-trigger all of their data fetches.
const sameUser = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(false);

  // Wipe credentials + cached user. Does NOT dispatch, so it is safe to call
  // from inside the 'auth:logout' listener (that would loop forever).
  const wipe = useCallback(() => {
    clearClientState();
    setUser(null);
    resetExpiryFlag();
  }, []);

  // Central auto-logout: clears session, toasts once, redirects to login
  const performLogout = useCallback(
    (reason) => {
      wipe();
      if (reason === 'expired' && !notifiedRef.current) {
        notifiedRef.current = true;
        toast.error('Session expired. Please login again.');
        const path = typeof window !== 'undefined' ? window.location.pathname : '/';
        if (
          !path.startsWith('/login') &&
          !path.startsWith('/register') &&
          !path.startsWith('/forgot-password')
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    },
    [wipe]
  );

  // Pull the authoritative profile from the backend. After a login the cached
  // copy can be stale (address edited elsewhere, renamed, role changed), so the
  // server is always the source of truth for a signed-in user.
  const syncFromServer = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.email) {
        const next = res.data;
        localStorage.setItem('user', JSON.stringify(next));
        setUser((prev) => (sameUser(prev, next) ? prev : next));
        return next;
      }
    } catch {}
    return null;
  }, []);

  const checkToken = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        performLogout('expired');
        setLoading(false);
        return;
      }
    } catch {
      wipe();
      setLoading(false);
      return;
    }

    // Show the cached profile immediately, then reconcile with the server.
    const cached = readCachedUser();
    if (cached) {
      setUser((prev) => (sameUser(prev, cached) ? prev : cached));
    } else {
      // No cached profile — fall back to the identity inside the token itself.
      const fallback = { email: decodedFallback(token) };
      if (fallback.email) {
        setUser((prev) => (sameUser(prev, fallback) ? prev : fallback));
      }
    }
    setLoading(false);
    await syncFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performLogout, wipe, syncFromServer]);

  useEffect(() => {
    checkToken();
    // Fired by the api layer when a request is rejected (401) or the stored
    // token is found expired — i.e. the session died on its own. Wipe, toast
    // once and bounce to the login page. Safe to call from here because
    // performLogout never dispatches, so it cannot loop.
    const onSessionLost = () => performLogout('expired');
    window.addEventListener('auth:logout', onSessionLost);
    // periodic check every 60s (local only, no network chatter)
    const interval = setInterval(checkToken, 60000);
    return () => {
      window.removeEventListener('auth:logout', onSessionLost);
      clearInterval(interval);
    };
  }, [checkToken, performLogout]);

  const login = (token, userData) => {
    notifiedRef.current = false;
    resetExpiryFlag();
    localStorage.setItem('token', token);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData || null);
    // Reconcile with the backend so profile/address/role are authoritative.
    syncFromServer();
  };

  const updateUser = (userData) => {
    if (!userData) return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...userData };
      try {
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {}
      return sameUser(prev, merged) ? prev : merged;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.email) {
        updateUser(res.data);
        return res.data;
      }
    } catch {}
    return null;
  };

  // Explicit sign-out. Everything cached in the browser is dropped — the
  // backend keeps the account, profile and orders, but this device keeps
  // nothing. `auth:signedout` is broadcast so the cart clears too; it is a
  // separate event from `auth:logout` so this never triggers the
  // "session expired" toast/redirect that belongs to the api layer.
  const logout = () => {
    wipe();
    notifiedRef.current = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:signedout'));
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, refreshUser, isAdmin, checkToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Safe fallback identity straight from the token when no cached profile exists.
function decodedFallback(token) {
  try {
    const d = jwtDecode(token);
    return { email: d.email, role: d.role, id: d.id };
  } catch {
    return null;
  }
}

export const useAuth = () => useContext(AuthContext);