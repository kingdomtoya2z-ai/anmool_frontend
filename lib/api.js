import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Set when we've already fired the expiry logout (prevents toast/redirect spam)
let expiryNotified = false;
export const resetExpiryFlag = () => { expiryNotified = false; };

const stripExpiredToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!expiryNotified) {
        expiryNotified = true;
        window.dispatchEvent(new Event('auth:logout'));
      }
      return true;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return false;
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Proactive: never send a dead token — log out immediately on expiry
    if (stripExpiredToken()) return config;
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const msg = error.response?.data?.message || '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('not authorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect on login page itself
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
