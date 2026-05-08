import React, { useContext } from 'react'; // 🟢 CORREÇÃO: Importamos o React
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// 🟢 CORREÇÃO: Trocamos JSX.Element por React.ReactNode (o padrão oficial do React)
export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user } = useContext(AuthContext);

    // Se o usuário não for ADMIN, redireciona ele na mesma hora para a Home!
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/home" replace />;
    }

    // Se for ADMIN, deixa ele ver a página normalmente
    return <>{children}</>;
}