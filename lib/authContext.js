'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { resetExpiryFlag } from './api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(false);

  // Central auto-logout: clears session, toasts once, redirects to login
  const performLogout = useCallback((reason) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    resetExpiryFlag();
    if (reason === 'expired' && !notifiedRef.current) {
      notifiedRef.current = true;
      toast.error('Session expired. Please login again.');
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/forgot-password')) {
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }
  }, []);

  const checkToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        // expired
        performLogout('expired');
        setLoading(false);
        return;
      }
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Keep object identity stable: only replace `user` when content
          // actually changed. Otherwise the 60s background check would create
          // a new object every minute and retrigger dashboard fetches.
          setUser((prev) => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
        } catch {
          setUser((prev) => (prev === null ? prev : null));
        }
      } else {
        const fallback = { email: decoded.email, role: decoded.role, id: decoded.id };
        setUser((prev) => (JSON.stringify(prev) === JSON.stringify(fallback) ? prev : fallback));
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkToken();
    const onLogout = () => performLogout('expired');
    window.addEventListener('auth:logout', onLogout);
    // periodic check every 60s
    const interval = setInterval(checkToken, 60000);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, userData) => {
    notifiedRef.current = false;
    resetExpiryFlag();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    const merged = { ...(user || {}), ...userData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser, isAdmin, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
