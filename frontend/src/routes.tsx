import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SignIn from './pages/SignIn';
import Category from './pages/Category';
import Product from './pages/Product';
import EditProduct from './pages/EditProduct';

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rota inicial: A porta da frente */}
                <Route path="/" element={<SignIn />} />

                {/* Rotas internas do painel */}
                <Route path="/category" element={<Category />} />
                <Route path="/product" element={<Product />} />
                <Route path="/edit-product" element={<EditProduct />} />
            </Routes>
        </BrowserRouter>
    );
}