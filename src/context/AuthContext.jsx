import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({
  currentUser: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user'));
    if (saved) setCurrentUser(saved);
  }, []);

  const signup = async (email, passwordHash) => {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash })
      .select()
      .maybeSingle();       // <— use maybeSingle here too
    if (error) throw error;
    setCurrentUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const login = async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();       // <— change single() → maybeSingle()
    if (error) throw error;
    if (!data) throw new Error('No user found with that email');
    setCurrentUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
