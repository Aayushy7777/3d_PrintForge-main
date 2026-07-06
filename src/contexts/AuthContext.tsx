import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate token on app mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function validateToken(token: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token validation error:', error);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || 'Login failed');
    }

    const data = await res.json();
    const token = (data as { token?: string })?.token;
    const user = (data as { user?: User })?.user ?? (data as User);

    if (!token) throw new Error('Login failed: missing token');
    localStorage.setItem('auth_token', token);
    setUser(user ?? null);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: fullName })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || 'Registration failed');
    }

    const data = await res.json();
    const token = (data as { token?: string })?.token;
    const user = (data as { user?: User })?.user ?? (data as User);

    if (!token) throw new Error('Registration failed: missing token');
    localStorage.setItem('auth_token', token);
    setUser(user ?? null);
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const getToken = async () => {
    return localStorage.getItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
