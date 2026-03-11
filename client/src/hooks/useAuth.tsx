import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
 user: { username: string } | null;
 login: (username: string, password: string) => Promise<boolean>;
 logout: () => void;
 isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<{ username: string } | null>(null);

 useEffect(() => {
 const token = localStorage.getItem('token');
 if (token) {
 fetch('/api/auth/verify', { 
 headers: { Authorization: `Bearer ${token}` }
 })
 .then(res => res.json())
 .then(data => {
 if (data.valid) {
 const stored = localStorage.getItem('user');
 if (stored) setUser(JSON.parse(stored));
 }
 });
 }
 }, []);

 const login = async (username: string, password: string) => {
 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password })
 });
 const data = await res.json();
 if (data.token) {
 localStorage.setItem('token', data.token);
 localStorage.setItem('user', JSON.stringify(data.user));
 setUser(data.user);
 return true;
 }
 return false;
 } catch {
 return false;
 }
 };

 const logout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 setUser(null);
 };

 return (
 <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used within AuthProvider');
 return ctx;
}
