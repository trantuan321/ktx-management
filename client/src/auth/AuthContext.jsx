import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStudent(null);
      return null;
    }
    const data = await api('/auth/me');
    setUser(data.user);
    setStudent(data.student || null);
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (getToken()) {
          const data = await api('/auth/me');
          if (active) {
            setUser(data.user);
            setStudent(data.student || null);
          }
        }
      } catch {
        setToken(null);
        if (active) {
          setUser(null);
          setStudent(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    const onLogout = () => {
      setUser(null);
      setStudent(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => {
      active = false;
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    setToken(data.token);
    setUser(data.user);
    setStudent(data.student || null);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStudent(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, student, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return context;
}
