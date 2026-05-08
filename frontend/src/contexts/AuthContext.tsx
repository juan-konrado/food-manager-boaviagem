import { createContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

// 🟢 1. CRIAMOS A IDENTIDADE DO USUÁRIO
type UserProps = {
  id: string;
  name: string;
  email: string;
  role: string; // <-- O nosso passe de mágica aqui!
}

type AuthContextData = {
  user: UserProps; // 🟢 2. AVISAMOS QUE O USUÁRIO EXISTE
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
  // 🟢 3. CRIAMOS A MEMÓRIA PARA GUARDAR QUEM ESTÁ LOGADO
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Assim que o site abre, ele roda essa função uma única vez
  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem('@boaviagem.token');

      if (token) {
        // Colamos o crachá no Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // 🟢 PERGUNTAMOS AO BACKEND: "Quem é o dono desse crachá?"
          const response = await api.get('/me');

          setUser(response.data); // Salvamos os dados (nome, role...)
          setIsAuthenticated(true);
        } catch (err) {
          // Se o token estiver vencido ou errado, limpamos a tela
          signOut();
        }
      }
    }

    checkLogin();
  }, []);

  async function signIn({ email, password }: SignInData) {
    try {
      const response = await api.post('/session', { email, password });
      const { token } = response.data;

      localStorage.setItem('@boaviagem.token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 🟢 LOGO APÓS LOGAR, BUSCAMOS OS DADOS DO USUÁRIO TAMBÉM!
      const userResponse = await api.get('/me');
      setUser(userResponse.data);

      setIsAuthenticated(true);

    } catch (err) {
      console.log("Erro ao acessar", err);
      alert("Erro ao fazer login. Verifique e-mail e senha!");
      throw err;
    }
  }

  function signOut() {
    localStorage.removeItem('@boaviagem.token');
    setUser({} as UserProps); // Limpa o usuário da memória
    setIsAuthenticated(false);
    window.location.href = '/';
  }

  return (
    // 🟢 4. EXPORTAMOS O 'user' PARA O SISTEMA INTEIRO PODER USAR
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}