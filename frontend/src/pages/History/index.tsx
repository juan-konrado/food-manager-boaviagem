import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { FiFileText, FiUser, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export type OrderProps = {
    id: string;
    tableId: string | null;
    name: string | null;
    waiter_name?: string | null; // 🟢 ADICIONADO: O sistema agora sabe que existe o nome do garçom
    status: string;
    total: number;
    updatedAt: string;
    table?: {
        number?: number | string;
        name?: string;
    };
    items?: {
        id: string;
        quantity: number;
        price: number; // Preço que foi vendido na época
        product: {
            name: string;
        }
    }[];
}

export default function History() {
    const [orders, setOrders] = useState<OrderProps[]>([]);

    // 🟢 NOVOS ESTADOS: Filtro de Data e Comanda Expandida
    const [filterDate, setFilterDate] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        async function loadHistory() {
            try {
                const response = await api.get('/orders/closed');
                setOrders(response.data);
            } catch (err) {
                console.log("Erro ao buscar histórico", err);
            }
        }
        loadHistory();
    }, []);

    // 🟢 LÓGICA DO FILTRO DE DATA
    const filteredOrders = orders.filter(order => {
        if (!filterDate) return true; // Se não tem filtro, mostra tudo

        // Pega a data da comanda e transforma no formato "YYYY-MM-DD" para comparar com o calendário
        const orderDate = new Date(order.updatedAt).toISOString().split('T')[0];
        return orderDate === filterDate;
    });

    // 🟢 CALCULADORA INTELIGENTE (Calcula pelo 'total' ou somando os itens na hora)
    function calculateOrderTotal(order: OrderProps) {
        if (order.total && Number(order.total) > 0) {
            return Number(order.total);
        }
        // Se o total estiver 0, soma os itens
        if (order.items && order.items.length > 0) {
            return order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
        }
        return 0;
    }

    // Calcula o faturamento da tela atual (respeitando o filtro!)
    const faturamentoTotal = filteredOrders.reduce((acc, order) => acc + calculateOrderTotal(order), 0);

    // Formata datas
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function formatMoney(value: number) {
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Abre/Fecha os detalhes da comanda
    function toggleOrderDetails(orderId: string) {
        if (expandedOrder === orderId) {
            setExpandedOrder(null); // Fecha se já estiver aberta
        } else {
            setExpandedOrder(orderId); // Abre a nova
        }
    }

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>

                    <div style={styles.headerTitle}>
                        <h1 style={styles.title}>Histórico de Vendas</h1>
                        <div style={styles.faturamentoCard}>
                            <FiDollarSign size={24} color="#101026" />
                            <span style={styles.faturamentoText}>
                                Faturamento: <strong>{formatMoney(faturamentoTotal)}</strong>
                            </span>
                        </div>
                    </div>

                    {/* 🟢 BARRA DE FILTROS */}
                    <div style={styles.filterBar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#8a8a8a' }}>Filtrar por dia:</span>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={styles.dateInput}
                            />
                            {filterDate && (
                                <button onClick={() => setFilterDate('')} style={styles.clearButton}>
                                    Limpar Filtro
                                </button>
                            )}
                        </div>
                        <span style={{ color: '#8a8a8a', fontSize: '14px' }}>
                            Mostrando {filteredOrders.length} comanda(s)
                        </span>
                    </div>

                    <div style={styles.listContainer}>
                        {filteredOrders.length === 0 && (
                            <span style={{ color: '#8a8a8a', textAlign: 'center', display: 'block', marginTop: '30px' }}>
                                Nenhuma comanda encontrada para esta data.
                            </span>
                        )}

                        {filteredOrders.map(order => {
                            const identificadorMesa = order.table ? (order.table.number || order.table.name) : 'Balcão/Avulsa';
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <article key={order.id} style={styles.orderCardWrapper}>
                                    {/* CABEÇALHO DO CARD */}
                                    <div
                                        style={styles.orderCard}
                                        onClick={() => toggleOrderDetails(order.id)}
                                    >
                                        <div style={styles.cardSection}>
                                            <div style={styles.tagMesa}>
                                                <FiFileText size={16} />
                                                <span>Mesa {identificadorMesa}</span>
                                            </div>
                                        </div>

                                        <div style={styles.cardSection}>
                                            <div style={styles.infoRow}>
                                                <FiUser size={18} color="#8a8a8a" />
                                                <span style={styles.infoText}>{order.name || 'Cliente Avulso'}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <FiCalendar size={18} color="#8a8a8a" />
                                                <span style={styles.infoText}>{formatDate(order.updatedAt)}</span>
                                            </div>

                                            {/* 🟢 ADICIONADO: Exibindo o nome do Atendente */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                                <span style={{ color: '#8a8a8a', fontSize: '12px' }}>Atendente:</span>
                                                <span style={{ color: '#3fffa3', fontSize: '13px', fontWeight: 'bold' }}>
                                                    {order.waiter_name || 'Desconhecido'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.cardSectionRight}>
                                            <span style={styles.totalLabel}>Total Pago</span>
                                            <span style={styles.totalValue}>{formatMoney(calculateOrderTotal(order))}</span>

                                            <div style={styles.expandHint}>
                                                {isExpanded ? <FiChevronUp size={20} color="#8a8a8a" /> : <FiChevronDown size={20} color="#8a8a8a" />}
                                                <span style={{ color: '#8a8a8a', fontSize: '12px' }}>{isExpanded ? 'Ocultar' : 'Ver Itens'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🟢 DETALHES DA COMANDA (ITENS) */}
                                    {isExpanded && (
                                        <div style={styles.itemsContainer}>
                                            <h3 style={{ color: '#FFF', fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid #1d1d2e', paddingBottom: '5px' }}>
                                                Consumo do Cliente:
                                            </h3>

                                            {order.items?.length === 0 ? (
                                                <span style={{ color: '#8a8a8a' }}>Nenhum item registrado nesta comanda.</span>
                                            ) : (
                                                order.items?.map(item => (
                                                    <div key={item.id} style={styles.itemRow}>
                                                        <span style={{ color: '#3fffa3', fontWeight: 'bold' }}>{item.quantity}x</span>
                                                        <span style={{ color: '#FFF', flex: 1, marginLeft: '10px' }}>{item.product.name}</span>
                                                        <span style={{ color: '#8a8a8a' }}>{formatMoney(Number(item.price) * item.quantity)}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>

                </main>
            </div>
        </>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '40px 20px' },
    main: { maxWidth: '900px', margin: '0 auto' },
    headerTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '20px' },
    title: { color: '#FFF', fontSize: '32px' },

    faturamentoCard: { backgroundColor: '#3fffa3', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    faturamentoText: { color: '#101026', fontSize: '20px' },

    // Estilos dos Filtros
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#101026', padding: '16px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #8a8a8a', flexWrap: 'wrap' as const, gap: '15px' },
    dateInput: { backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', padding: '8px 12px', borderRadius: '4px', outline: 'none', colorScheme: 'dark' },
    clearButton: { backgroundColor: 'transparent', color: '#ff3f4b', border: '1px solid #ff3f4b', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },

    listContainer: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },

    orderCardWrapper: { display: 'flex', flexDirection: 'column' as const, backgroundColor: '#101026', border: '1px solid #8a8a8a', borderRadius: '8px', overflow: 'hidden' as const },
    orderCard: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '20px', cursor: 'pointer', transition: 'background 0.2s', '&:hover': { backgroundColor: '#181836' } },

    cardSection: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    cardSectionRight: { display: 'flex', flexDirection: 'column' as const, gap: '5px', alignItems: 'flex-end', minWidth: '120px' },

    tagMesa: { backgroundColor: '#1d1d2e', color: '#3fffa3', padding: '6px 12px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', border: '1px solid #3fffa3' },

    infoRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    infoText: { color: '#FFF', fontSize: '16px' },

    totalLabel: { color: '#8a8a8a', fontSize: '14px', textTransform: 'uppercase' as const, letterSpacing: '1px' },
    totalValue: { color: '#3fffa3', fontSize: '24px', fontWeight: 'bold' },
    expandHint: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' },

    // Estilos da Lista de Itens (Sanfona)
    itemsContainer: { backgroundColor: '#181836', padding: '20px', borderTop: '1px solid #8a8a8a' },
    itemRow: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #3a3a3a' }
};