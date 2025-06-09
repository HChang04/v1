
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockLogin, mockFetchCurrentUser } from '../services/mockApiService';
import { MOCK_API_DELAY } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password_not_used: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Try to get user from local storage or a token
        const storedUser = localStorage.getItem('hrm_user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          // In a real app, validate token with backend
          // For mock, just set user
          setUser(parsedUser);
        } else {
          // If no stored user, try to fetch (e.g. if there's a session cookie)
          // For mock, this will likely return null if not logged in
          // const currentUser = await mockFetchCurrentUser();
          // setUser(currentUser);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setUser(null);
        localStorage.removeItem('hrm_user');
      } finally {
        // Artificial delay to simulate loading
        setTimeout(() => setLoading(false), MOCK_API_DELAY / 2);
      }
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password_not_used: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockLogin(username, password_not_used);
      setUser(loggedInUser);
      localStorage.setItem('hrm_user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      localStorage.removeItem('hrm_user');
      throw error; // Re-throw to be caught by login page
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrm_user');
    // In a real app, call a backend logout endpoint
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
