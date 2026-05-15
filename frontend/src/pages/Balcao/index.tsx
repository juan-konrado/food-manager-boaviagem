import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { FiUsers, FiUser, FiSearch } from 'react-icons/fi'; // 🟢 Adicionamos o ícone de lupa
import Modal from 'react-modal'; 
import { ModalOrder } from '../../components/ModalOrder';
import { ModalNewOrder } from '../../components/ModalNewOrder'; 
import { api } from '../../services/api';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');

export type OrderProps = {
    id: string;
    tableId: string | null;
    name: string | null;
    status?: string;
    total?: number | string;
    table?: {
        number?: number | string;
        name?: string;
    };
}

export type OrderItemProps = {
    id: string;
    quantity: number; 
    orderId: string;
    productId: string;
    product: {
        id: string;
        name: string;
        description: string;
        price: string | number;
    };
    order: {
        id: string;
        name: string | null;
        total: number | string;
    }
}

export default function Balcao() {
    const [activeOrders, setActiveOrders] = useState<OrderProps[]>([]);
    
    // 🟢 NOVO ESTADO: O que o usuário digitou na barra de busca
    const [search, setSearch] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalTable, setModalTable] = useState<string | null>(null);
    const [modalItems, setModalItems] = useState<OrderItemProps[]>([]);
    const [modalOrders, setModalOrders] = useState<OrderProps[]>([]);

    const [modalNewVisible, setModalNewVisible] = useState(false);
    const [newTableNumber, setNewTableNumber] = useState<string | null>(null);

    const mesas = Array.from({ length: 25 }, (_, i) => String(i + 1));

    useEffect(() => {
        async function loadOrders() {
            try {
                const response = await api.get('/orders');
                setActiveOrders(response.data);
            } catch (err) {
                console.log("Erro ao carregar as mesas", err);
            }
        }
        loadOrders();
    }, []);

    function handleOpenDetails(tableId: string | null, orders: OrderProps[]) {
        if (orders.length === 0) {
            setNewTableNumber(tableId);
            setModalNewVisible(true);
            return;
        }
        setModalTable(tableId);
        setModalOrders(orders);
        setModalVisible(true);
    }

    function handleCloseModal() {
        setModalVisible(false);
    }

    async function refreshOrders() {
        try {
            const response = await api.get('/orders');
            setActiveOrders(response.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        refreshOrders();
    }, []);

    useEffect(() => {
        const socket = io('http://localhost:3333');
        socket.on('orders_updated', () => {
            console.log("Ouvimos o grito! Atualizando as mesas...");
            refreshOrders(); 
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    // ==========================================
    // 🟢 LÓGICA DE FILTRAGEM (A MÁGICA DA BUSCA)
    // ==========================================

    const searchLower = search.toLowerCase();

    // 1. Filtramos as Mesas (Aparece se o número bater OU se o nome do cliente na mesa bater)
    const mesasFiltradas = mesas.filter(numeroMesa => {
        if (!search) return true; // Se não tem busca, mostra tudo
        
        // Verifica se o número da mesa bate com a pesquisa
        if (numeroMesa.includes(searchLower)) return true;

        // Verifica se algum cliente sentado NESTA mesa bate com a pesquisa
        const clientesNaMesa = activeOrders.filter(order => {
            if (!order.table) return false;
            return String(order.table.number) === numeroMesa || String(order.table.name) === numeroMesa;
        });

        // Se achar o nome do cliente, a mesa continua visível!
        return clientesNaMesa.some(cliente => cliente.name?.toLowerCase().includes(searchLower));
    });

    // 2. Separa e Filtra as Comandas Avulsas
    const comandasAvulsas = activeOrders.filter(order => {
        if (!order.tableId || !order.table) return true;
        const identificadorMesa = String(order.table.number || order.table.name);
        if (!mesas.includes(identificadorMesa)) return true;
        return false;
    }).filter(order => {
        // Aplica a barra de busca nas avulsas também!
        if (!search) return true;
        return order.name?.toLowerCase().includes(searchLower);
    });

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>

                    <div style={styles.headerCaixa}>
                        <h1 style={styles.title}>Frente de Caixa - PDV</h1>
                        <span style={styles.statusBolinha}>🟢 Caixa Aberto</span>
                    </div>

                    {/* 🟢 NOSSA NOVA BARRA DE PESQUISA */}
                    <div style={styles.searchContainer}>
                        <FiSearch size={24} color="#8a8a8a" style={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Buscar comanda por nome do cliente ou número da mesa..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.gridLayout}>
                        {/* LADO ESQUERDO: Mapa das Mesas */}
                        <div style={styles.mesasSection}>
                            <h2 style={styles.subtitle}>Mapa de Mesas</h2>

                            <div style={styles.mesasGrid}>
                                {/* 🟢 Agora mapeamos as mesasFiltradas no lugar de mesas */}
                                {mesasFiltradas.length === 0 && (
                                    <p style={{ color: '#8a8a8a', gridColumn: '1 / -1' }}>Nenhuma mesa encontrada com esse nome/número.</p>
                                )}

                                {mesasFiltradas.map(numeroMesa => {
                                    const clientesNaMesa = activeOrders.filter(order => {
                                        if (!order.table) return false;
                                        return String(order.table.number) === numeroMesa || String(order.table.name) === numeroMesa;
                                    });

                                    const isOcupada = clientesNaMesa.length > 0;

                                    return (
                                        <button
                                            key={numeroMesa}
                                            style={{
                                                ...styles.mesaButton,
                                                backgroundColor: isOcupada ? '#ff3f4b' : '#101026', 
                                                borderColor: isOcupada ? '#ff3f4b' : '#3fffa3'
                                            }}
                                            onClick={() => handleOpenDetails(numeroMesa, clientesNaMesa)}
                                        >
                                            <span style={{ ...styles.mesaNumero, color: isOcupada ? '#FFF' : '#3fffa3' }}>
                                                {numeroMesa}
                                            </span>

                                            {isOcupada && (
                                                <div style={styles.clientesCount}>
                                                    <FiUsers size={14} />
                                                    <span>{clientesNaMesa.length}</span>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* LADO DIREITO: Comandas Avulsas / Balcão */}
                        <div style={styles.avulsasSection}>
                            <h2 style={styles.subtitle}>Comandas Avulsas (Balcão)</h2>

                            <div style={styles.avulsasList}>
                                {comandasAvulsas.length === 0 && (
                                    <p style={{ color: '#8a8a8a', textAlign: 'center', marginTop: '20px' }}>
                                        {search ? "Nenhuma comanda encontrada na busca." : "Nenhuma comanda avulsa no momento."}
                                    </p>
                                )}

                                {comandasAvulsas.map(order => (
                                    <button
                                        key={order.id}
                                        style={styles.avulsaItem}
                                        onClick={() => handleOpenDetails(null, [order])}
                                    >
                                        <div style={styles.avulsaHeader}>
                                            <FiUser size={20} color="#3fffa3" />
                                            <span style={styles.avulsaName}>{order.name}</span>
                                        </div>
                                        <span style={styles.avulsaStatus}>Em aberto</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {modalVisible && (
                        <ModalOrder
                            isOpen={modalVisible}
                            onRequestClose={handleCloseModal}
                            tableId={modalTable}
                            orders={modalOrders}
                        />
                    )}

                    {modalNewVisible && (
                        <ModalNewOrder
                            isOpen={modalNewVisible}
                            onRequestClose={() => setModalNewVisible(false)}
                            tableNumber={newTableNumber}
                            onSuccess={refreshOrders} 
                        />
                    )}

                </main>
            </div>
        </>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '30px 20px' },
    main: { width: '100%', maxWidth: '1400px', margin: '0 auto' },
    headerCaixa: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #8a8a8a', paddingBottom: '15px' },
    title: { color: '#FFF', fontSize: '32px' },
    statusBolinha: { backgroundColor: '#103a20', color: '#3fffa3', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' },

    // 🟢 Estilos da nova barra de pesquisa
    searchContainer: { position: 'relative' as const, marginBottom: '30px' },
    searchIcon: { position: 'absolute' as const, left: '15px', top: '50%', transform: 'translateY(-50%)' },
    searchInput: { width: '100%', padding: '16px 16px 16px 50px', fontSize: '16px', backgroundColor: '#101026', border: '1px solid #8a8a8a', borderRadius: '8px', color: '#FFF', outline: 'none' },

    gridLayout: { display: 'flex', gap: '30px', flexWrap: 'wrap' as const },

    mesasSection: { flex: 2, minWidth: '350px', backgroundColor: '#101026', padding: '24px', borderRadius: '8px', border: '1px solid #8a8a8a' },
    subtitle: { color: '#FFF', fontSize: '20px', marginBottom: '20px' },
    mesasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '15px' },
    mesaButton: { height: '90px', borderRadius: '8px', border: '2px solid', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' as const },
    mesaNumero: { fontSize: '28px', fontWeight: 'bold' },
    clientesCount: { position: 'absolute' as const, bottom: '5px', display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF', fontSize: '12px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px' },

    avulsasSection: { flex: 1, minWidth: '300px', backgroundColor: '#101026', padding: '24px', borderRadius: '8px', border: '1px solid #8a8a8a', maxHeight: '600px', overflowY: 'auto' as const },
    avulsasList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    avulsaItem: { backgroundColor: '#1d1d2e', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
    avulsaHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
    avulsaName: { color: '#FFF', fontSize: '18px', fontWeight: 'bold' },
    avulsaStatus: { color: '#ff3f4b', fontSize: '12px', textTransform: 'uppercase' as const, fontWeight: 'bold' }
};