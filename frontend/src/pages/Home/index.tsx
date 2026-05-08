import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { Link } from 'react-router-dom';
import { FiMonitor, FiTrendingUp, FiBox, FiList } from 'react-icons/fi';

export default function Home() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>
                    <h1 style={styles.title}>
                        Olá, {user?.name}! 👋
                    </h1>
                    <p style={styles.subtitle}>
                        Bem-vindo ao sistema de gestão do <strong>Boa Viagem Pub</strong>.
                    </p>

                    <div style={styles.cardsGrid}>
                        {/* O CARD DO CAIXA: Todo mundo vê */}
                        <Link to="/balcao" style={styles.card}>
                            <div style={{ ...styles.iconCircle, backgroundColor: '#3fffa322' }}>
                                <FiMonitor size={32} color="#3fffa3" />
                            </div>
                            <h2 style={styles.cardTitle}>Caixa / PDV</h2>
                            <p style={styles.cardDesc}>Gerenciar mesas e comandas em tempo real.</p>
                        </Link>

                        {/* CARDS EXCLUSIVOS DO ADMIN */}
                        {user?.role === 'ADMIN' && (
                            <>
                                <Link to="/dashboard" style={styles.card}>
                                    <div style={{ ...styles.iconCircle, backgroundColor: '#ff3f4b22' }}>
                                        <FiTrendingUp size={32} color="#ff3f4b" />
                                    </div>
                                    <h2 style={styles.cardTitle}>Financeiro</h2>
                                    <p style={styles.cardDesc}>Acompanhar faturamento e lucros.</p>
                                </Link>

                                <Link to="/product" style={styles.card}>
                                    <div style={{ ...styles.iconCircle, backgroundColor: '#1e90ff22' }}>
                                        <FiBox size={32} color="#1e90ff" />
                                    </div>
                                    <h2 style={styles.cardTitle}>Produtos</h2>
                                    <p style={styles.cardDesc}>Cadastrar e organizar o estoque.</p>
                                </Link>

                                <Link to="/category" style={styles.card}>
                                    <div style={{ ...styles.iconCircle, backgroundColor: '#ffbc4222' }}>
                                        <FiList size={32} color="#ffbc42" />
                                    </div>
                                    <h2 style={styles.cardTitle}>Categorias</h2>
                                    <p style={styles.cardDesc}>Gerenciar grupos de produtos.</p>
                                </Link>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '40px 20px' },
    main: { width: '100%', maxWidth: '1000px', textAlign: 'center' as const, marginTop: '40px' },
    title: { color: '#FFF', fontSize: '36px', marginBottom: '10px' },
    subtitle: { color: '#8a8a8a', fontSize: '18px', marginBottom: '50px' },
    cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#101026', padding: '30px', borderRadius: '12px', border: '1px solid #8a8a8a', textDecoration: 'none', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', transition: 'transform 0.2s' },
    iconCircle: { width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' },
    cardTitle: { color: '#FFF', fontSize: '20px', marginBottom: '10px' },
    cardDesc: { color: '#8a8a8a', fontSize: '14px', lineHeight: '1.4' }
};