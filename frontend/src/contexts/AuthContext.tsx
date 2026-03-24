import { createContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

type AuthContextData = {
  isAuthenticated: boolean;
  signIn: (credentials: SignInData) => Promise<void>;
  signOut: () => void;
}

type SignInData = {
  email: string;
  password: string;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- A MÁGICA NOVA ESTÁ AQUI ---
  // Assim que o site abre, ele roda essa função uma única vez
  useEffect(() => {
    const token = localStorage.getItem('@boaviagem.token');

    // Se achou o token salvo, ele "cola" o crachá no Axios novamente
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);
  // -------------------------------

  async function signIn({ email, password }: SignInData) {
    try {
      const response = await api.post('/session', { email, password });
      const { token } = response.data;

      localStorage.setItem('@boaviagem.token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setIsAuthenticated(true);

    } catch (err) {
      console.log("Erro ao acessar", err);
      alert("Erro ao fazer login. Verifique e-mail e senha!");
      throw err; 
    }
  }

  function signOut() {
    localStorage.removeItem('@boaviagem.token');
    setIsAuthenticated(false);
    window.location.href = '/'; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}