import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SignIn from './pages/SignIn';
import Category from './pages/Category';
import Product from './pages/Product';
import EditProduct from './pages/EditProduct';
import Dashboard from './pages/Dashboard';
import Balcao from './pages/Balcao';
import Home from './pages/Home';
import History from './pages/History';
import { AdminRoute } from './routes/adminRoute';

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rota inicial: A porta da frente */}
                <Route path="/" element={<SignIn />} />

                {/* 🟢 ROTAS LIVRES: Todos que estão logados podem acessar */}
                <Route path="/home" element={<Home />} />
                <Route path="/balcao" element={<Balcao />} />

                {/* 🔴 ROTAS PROTEGIDAS: O AdminRoute chuta quem não for ADMIN */}
                <Route path="/category" element={<AdminRoute><Category /></AdminRoute>} />
                <Route path="/product" element={<AdminRoute><Product /></AdminRoute>} />
                <Route path="/edit-product" element={<AdminRoute><EditProduct /></AdminRoute>} />
                <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/historico" element={ <History /> } />
            </Routes>
        </BrowserRouter>
    );
}