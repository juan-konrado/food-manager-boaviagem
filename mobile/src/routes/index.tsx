import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';

import AppRoutes from './app.routes';
import AuthRoutes from './auth.routes';

// Importa o nosso cérebro
import { AuthContext } from '../contexts/AuthContext';

export default function Routes() {
    // Pega a informação se está logado e se está carregando a memória
    const { isAuthenticated, loading } = useContext(AuthContext);

    // Se o app estiver abrindo e lendo o celular, mostra um loading de tela cheia
    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1d1d2e', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={60} color="#FFF" />
            </View>
        )
    }

    // Se estiver logado, mostra o Dashboard. Se não, mostra o Login.
    return (
        isAuthenticated ? <AppRoutes /> : <AuthRoutes />
    )
}