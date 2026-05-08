import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';

export function Header() {
    const { signOut, user } = useContext(AuthContext);

    return (
        <header style={styles.headerContainer}>
            <div style={styles.headerContent}>

                {/* Logo que volta para a Home Segura (Balcão) */}
                <Link to="/balcao" style={styles.logo}>
                    Boa Viagem <span style={{ color: '#3fffa3' }}>Pub</span>
                </Link>

                {/* Menu de Navegação */}
                <nav style={styles.menuNav}>

                    {/* 🟢 TUDOS PODEM VER (Acesso Livre) */}
                    <Link to="/balcao" style={styles.link}>Caixa/PDV</Link>

                    {/* 🔴 SÓ O ADMIN (GERENTE) PODE VER ESSES BOTÕES */}
                    {user?.role === 'ADMIN' && (
                        <>
                            <Link to="/category" style={styles.link}>Categorias</Link>
                            <Link to="/product" style={styles.link}>Produtos</Link>
                            <Link to="/edit-product" style={styles.link}>Editar Produto</Link>
                            <Link to="/dashboard" style={styles.link}>Painel</Link>
                        </>
                    )}

                    <button onClick={signOut} style={styles.logoutBtn} title="Sair do Sistema">
                        <FiLogOut color="#FFF" size={24} />
                    </button>
                </nav>

            </div>
        </header>
    );
}

const styles = {
    headerContainer: { height: '80px', backgroundColor: '#101026', borderBottom: '1px solid #8a8a8a' },
    headerContent: { maxWidth: '1200px', height: '80px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { color: '#FFF', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' },
    menuNav: { display: 'flex', alignItems: 'center', gap: '30px' },
    link: { color: '#FFF', textDecoration: 'none', fontSize: '18px', transition: 'color 0.2s', cursor: 'pointer' },
    logoutBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};