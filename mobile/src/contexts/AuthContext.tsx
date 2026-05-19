import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

// Definindo os formatos dos dados (Typescript)
type UserProps = {
    id: string;
    name: string;
    email: string;
    token: string;
}

type AuthContextData = {
    user: UserProps | null;
    isAuthenticated: boolean;
    signIn: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean; // Para mostrar uma telinha de carregando ao abrir o app
}

type AuthProviderProps = {
    children: ReactNode;
}

// Criando o Contexto
export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps | null>(null);
    const [loading, setLoading] = useState(true);

    // useEffect roda automático assim que o App abre!
    useEffect(() => {
        async function loadUserInfo() {
            // Vai no celular e procura se tem token salvo de ontem
            const token = await AsyncStorage.getItem('@foodmanager:token');

            if (token) {
                // Se achou o token, injeta ele na API para as próximas requisições
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Simula que o usuário está logado (na vida real, buscaríamos os dados dele no banco aqui)
                setUser({
                    id: '123',
                    name: 'Garçom',
                    email: 'logado@app.com',
                    token: token
                });
            }
            setLoading(false);
        }
        loadUserInfo();
    }, []);

    // A função de Login que estava na tela, agora mora no cérebro
    async function signIn({ email, password }: any) {
        try {
            const response = await api.post('/session', { email, password });
            const { id, name, token } = response.data;

            // Salva no celular
            await AsyncStorage.setItem('@foodmanager:token', token);

            // Ensina a API a usar o token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Salva na memória do App
            setUser({ id, name, email, token });

        } catch (err) {
            console.log("Erro ao logar: ", err);
            throw err; // Joga o erro para a tela de SignIn mostrar o alerta
        }
    }

    // Função de Sair (Logout)
    async function signOut() {
        await AsyncStorage.clear(); // Limpa o celular
        setUser(null); // Limpa a memória
    }

    return (
        // Compartilha as funções com todas as telas (children)
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}