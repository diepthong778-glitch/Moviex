import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getStoredToken, parseStoredJson } from '../utils/api';

const AuthContext = createContext();
const THEME_KEY = 'moviex.theme';

const applyTheme = (isDarkMode) => {
  const theme = isDarkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parsedUser = parseStoredJson(localStorage.getItem('user'), null);
    if (parsedUser && typeof parsedUser === 'object') {
      setUser(parsedUser);
      if (typeof parsedUser.darkMode === 'boolean') {
        applyTheme(parsedUser.darkMode);
      }
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }

    if (!document.documentElement.getAttribute('data-theme')) {
      const persistedTheme = localStorage.getItem(THEME_KEY) || 'dark';
      document.documentElement.setAttribute('data-theme', persistedTheme);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (typeof userData.darkMode === 'boolean') {
      applyTheme(userData.darkMode);
    }
  };

  const logout = () => {
    axios.post('/api/auth/logout').catch(() => {});
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateSubscription = (plan) => {
      const updatedUser = { ...user, subscriptionPlan: plan };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getToken = () => {
    if (user?.token) return user.token;
    return getStoredToken();
  };
  
  const checkRole = (role) => {
      return user && user.roles && user.roles.includes(role);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSubscription, getToken, checkRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
