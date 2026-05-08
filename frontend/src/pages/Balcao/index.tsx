import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { FiUsers, FiUser } from 'react-icons/fi';
import Modal from 'react-modal'; // <-- IMPORTA O MODAL
import { ModalOrder } from '../../components/ModalOrder';
import { ModalNewOrder } from '../../components/ModalNewOrder'; // 🟢 NOSSA JANELA NOVA AQUI!
import { api } from '../../services/api';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');
// Tipagem do que é um pedido no nosso sistema
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
    quantity: number; // Ou quantity, dependendo do seu banco
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

    // 🟢 NOVOS ESTADOS PARA A JANELA
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
            // 🟢 MESA LIVRE! Chama a janela verde de nova comanda
            setNewTableNumber(tableId);
            setModalNewVisible(true);
            return;
        }

        // MESA OCUPADA! Abre o Raio-X normal
        setModalTable(tableId);
        setModalOrders(orders);
        setModalVisible(true);
    }



    function handleCloseModal() {
        setModalVisible(false);
    }

    // Essa função vai lá na API e atualiza o nosso mapa!
    async function refreshOrders() {
        try {
            const response = await api.get('/orders');
            setActiveOrders(response.data);
        } catch (err) {
            console.log(err);
        }
    }

    // (O seu useEffect antigo que chama refreshOrders ao abrir a tela fica aqui)
    useEffect(() => {
        refreshOrders();
    }, []);

    // ==========================================
    // 🟢 NOSSO RADINHO ESCUTANDO O BACKEND AO VIVO
    // ==========================================
    useEffect(() => {
        // Conecta no megafone do backend
        const socket = io('http://localhost:3333');

        // Fica escutando o grito chamado 'orders_updated'
        socket.on('orders_updated', () => {
            console.log("Ouvimos o grito! Atualizando as mesas...");
            refreshOrders(); // Dá o "F5" invisível e silencioso!
        });

        // Se o caixa fechar a tela, desliga o rádio para não gastar memória
        return () => {
            socket.disconnect();
        };
    }, []);

    // Filtra as comandas avulsas (Balcão) com a regra de exclusão perfeita
    const comandasAvulsas = activeOrders.filter(order => {
        // 1. Se realmente vier vazio, é avulsa
        if (!order.tableId || !order.table) return true;

        // Pega o que o banco mandou (pode ser "Balcão", "99", "Avulsa", etc)
        const identificadorMesa = String(order.table.number || order.table.name);

        // 2. A MÁGICA: Se esse identificador NÃO estiver na nossa lista de 1 a 25, é avulsa!
        if (!mesas.includes(identificadorMesa)) {
            return true;
        }

        // Se passou por tudo e está entre 1 e 25, então NÃO é avulsa (vai acender o quadradinho)
        return false;
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

                    <div style={styles.gridLayout}>
                        {/* LADO ESQUERDO: Mapa das 25 Mesas */}
                        <div style={styles.mesasSection}>
                            <h2 style={styles.subtitle}>Mapa de Mesas</h2>

                            <div style={styles.mesasGrid}>
                                {mesas.map(numeroMesa => {
                                    // Agora procuramos dentro do objeto 'table' que o backend enviou!
                                    const clientesNaMesa = activeOrders.filter(order => {
                                        if (!order.table) return false;

                                        // Compara tanto se a sua coluna for "number" ou "name" no banco
                                        return String(order.table.number) === numeroMesa || String(order.table.name) === numeroMesa;
                                    });

                                    const isOcupada = clientesNaMesa.length > 0;

                                    return (
                                        <button
                                            key={numeroMesa}
                                            style={{
                                                ...styles.mesaButton,
                                                backgroundColor: isOcupada ? '#ff3f4b' : '#101026', // Vermelho se ocupada, escura se livre
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
                                    <p style={{ color: '#8a8a8a', textAlign: 'center', marginTop: '20px' }}>Nenhuma comanda avulsa no momento.</p>
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
                    {/* 🟢 NOSSA JANELA MODAL INVISÍVEL ESPERANDO O CLIQUE */}
                    {modalVisible && (
                        <ModalOrder
                            isOpen={modalVisible}
                            onRequestClose={handleCloseModal}
                            tableId={modalTable}
                            orders={modalOrders}
                        />
                    )}

                    {/* 🟢 JANELA NOVA: ABRIR MESA LIVRE */}
                    {modalNewVisible && (
                        <ModalNewOrder
                            isOpen={modalNewVisible}
                            onRequestClose={() => setModalNewVisible(false)}
                            tableNumber={newTableNumber}
                            onSuccess={refreshOrders} // Atualiza a tela quando abrir!
                        />
                    )}

                </main>
            </div>
        </>
    );
}

// O Visual da nossa central de comando
const styles = {
    container: { minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '30px 20px' },
    main: { width: '100%', maxWidth: '1400px', margin: '0 auto' },
    headerCaixa: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #8a8a8a', paddingBottom: '15px' },
    title: { color: '#FFF', fontSize: '32px' },
    statusBolinha: { backgroundColor: '#103a20', color: '#3fffa3', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' },

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