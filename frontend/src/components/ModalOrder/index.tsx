import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FiX, FiPlus, FiCheckSquare, FiArrowLeft, FiUser, FiShoppingCart } from 'react-icons/fi';
import { api } from '../../services/api';
import type { OrderItemProps, OrderProps } from '../../pages/Balcao';

interface ModalOrderProps {
    isOpen: boolean;
    onRequestClose: () => void;
    tableId: string | null;
    orders: OrderProps[];
}

const customStyles = {
    content: {
        top: '50%', bottom: 'auto', left: '50%', right: 'auto',
        padding: '30px', transform: 'translate(-50%, -50%)',
        backgroundColor: '#101026', border: '1px solid #8a8a8a',
        borderRadius: '8px', width: '100%', maxWidth: '600px', color: '#FFF'
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 999 }
};

export function ModalOrder({ isOpen, onRequestClose, tableId, orders }: ModalOrderProps) {
    // 🟢 TODOS OS ESTADOS (MEMÓRIAS) FICAM AQUI DENTRO DA FUNÇÃO!
    const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);
    const [items, setItems] = useState<OrderItemProps[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados do Modo "Adicionar Produto"
    const [isAdding, setIsAdding] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categorySelected, setCategorySelected] = useState('');
    const [productSelected, setProductSelected] = useState('');
    const [qtdToAdd, setQtdToAdd] = useState('1');

    // Estados do Modo "Pagamento"
    const [isClosing, setIsClosing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('PIX');

    // ==========================================
    // FUNÇÕES DE AÇÃO
    // ==========================================

    async function handleSelectClient(order: OrderProps) {
        setSelectedOrder(order);
        setLoading(true);
        setIsAdding(false);
        setIsClosing(false); // Reseta a tela de pagamento ao trocar de cliente

        try {
            const response = await api.get('/order/detail', {
                params: { order_id: order.id }
            });
            setItems(response.data);
        } catch (err) {
            console.log(err);
            alert("Erro ao buscar os itens.");
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenAddMode() {
        setIsAdding(true);
        setIsClosing(false);
        try {
            const response = await api.get('/category');
            setCategories(response.data);
            if (response.data.length > 0) {
                setCategorySelected(response.data[0].id);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        async function loadProducts() {
            if (!categorySelected) return;
            try {
                const response = await api.get('/category/product', {
                    params: { category_id: categorySelected }
                });
                setProducts(response.data);
                if (response.data.length > 0) {
                    setProductSelected(response.data[0].id);
                } else {
                    setProductSelected('');
                }
            } catch (err) {
                console.log(err);
            }
        }
        loadProducts();
    }, [categorySelected]);

    async function handleAddItem() {
        if (!productSelected) {
            alert("Selecione um produto válido!");
            return;
        }

        try {
            await api.post('/order/add', {
                order_id: selectedOrder?.id,
                product_id: productSelected,
                quantity: Number(qtdToAdd)
            });

            alert("Produto lançado com sucesso!");
            setIsAdding(false);
            setQtdToAdd('1');
            if (selectedOrder) handleSelectClient(selectedOrder);

        } catch (err) {
            console.log(err);
            alert("Erro ao lançar o produto.");
        }
    }

    async function handleFinishOrder() {
        if (!selectedOrder) return;

        try {
            await api.put('/order/finish', {
                order_id: selectedOrder.id,
                paymentMethod: paymentMethod
            });

            alert(`Conta paga via ${paymentMethod}! Dinheiro no caixa! 💰`);
            onRequestClose();
        } catch (err) {
            console.log(err);
            alert("Erro ao fechar a conta. Verifique o backend!");
        }
    }

    // ==========================================
    // CÁLCULOS MATEMÁTICOS
    // ==========================================

    const totalCalculado = items.reduce((acc, item) => {
        const preco = Number(item.product.price) || 0;
        const quantidade = Number(item.quantity) || 0;
        return acc + (preco * quantidade);
    }, 0);

    const valorFinal = selectedOrder?.total && Number(selectedOrder.total) > 0
        ? Number(selectedOrder.total)
        : totalCalculado;

    // ==========================================
    // O VISUAL DA TELA (RENDER)
    // ==========================================

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>

            <button type="button" onClick={onRequestClose} style={styles.closeButton}>
                <FiX size={24} color="#ff3f4b" />
            </button>

            <div style={styles.container}>

                {/* TELA 1: LISTA DE CLIENTES */}
                {!selectedOrder ? (
                    <>
                        <h2 style={styles.title}>{tableId ? `Mesa ${tableId}` : 'Comandas Avulsas'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            {orders.map(order => (
                                <button key={order.id} style={styles.clientButton} onClick={() => handleSelectClient(order)}>
                                    <FiUser size={20} color="#3fffa3" />
                                    <span style={styles.clientNameBtn}>{order.name || 'Sem nome'}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (

                    /* TELAS INTERNAS (Itens, Add, Pagamento) */
                    <>
                        <div style={styles.headerDetail}>
                            <button style={styles.backButton} onClick={() => {
                                if (isClosing) setIsClosing(false);
                                else if (isAdding) setIsAdding(false);
                                else setSelectedOrder(null);
                            }}>
                                <FiArrowLeft size={24} color="#3fffa3" />
                            </button>
                            <h2 style={styles.title}>
                                {isClosing ? 'Finalizar Pagamento' : isAdding ? 'Lançar Novo Produto' : `Consumo de ${selectedOrder.name || 'Sem nome'}`}
                            </h2>
                        </div>

                        {loading ? (
                            <p style={{ color: '#3fffa3', textAlign: 'center' }}>Buscando dados...</p>
                        ) : isClosing ? (

                            /* 🟢 TELA DE PAGAMENTO */
                            <div style={styles.addForm}>
                                <h3 style={{ color: '#FFF', textAlign: 'center', fontSize: '28px', margin: '10px 0' }}>
                                    Total: R$ {valorFinal.toFixed(2).replace('.', ',')}
                                </h3>

                                <label style={styles.label}>Forma de Pagamento</label>
                                <select style={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="PIX">Pix</option>
                                    <option value="DEBITO">Cartão de Débito</option>
                                    <option value="CREDITO">Cartão de Crédito</option>
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="FIADO">Fiado (Caderneta)</option>
                                </select>

                                <button style={styles.buttonConfirmAdd} onClick={handleFinishOrder}>
                                    <FiCheckSquare size={20} /> Confirmar Pagamento
                                </button>
                            </div>

                        ) : isAdding ? (

                            /* TELA DE ADICIONAR PRODUTO */
                            <div style={styles.addForm}>
                                <label style={styles.label}>Selecione a Categoria</label>
                                <select style={styles.select} value={categorySelected} onChange={(e) => setCategorySelected(e.target.value)}>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>

                                <label style={styles.label}>Selecione o Produto</label>
                                <select style={styles.select} value={productSelected} onChange={(e) => setProductSelected(e.target.value)} disabled={products.length === 0}>
                                    {products.length === 0 && <option>Nenhum produto nesta categoria</option>}
                                    {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                                </select>

                                <label style={styles.label}>Quantidade</label>
                                <input type="number" min="1" style={styles.input} value={qtdToAdd} onChange={(e) => setQtdToAdd(e.target.value)} />

                                <button style={styles.buttonConfirmAdd} onClick={handleAddItem}>
                                    <FiShoppingCart size={20} /> Confirmar Lançamento
                                </button>
                            </div>

                        ) : (

                            /* TELA DE ITENS DA COMANDA */
                            <>
                                <div style={styles.itemsList}>
                                    {items.length === 0 && <p style={{ color: '#8a8a8a' }}>Nenhum produto lançado ainda.</p>}
                                    {items.map(item => (
                                        <div key={item.id} style={styles.item}>
                                            <span style={styles.itemQtd}>{item.quantity}x</span>
                                            <span style={styles.itemName}>{item.product.name}</span>
                                            <span style={styles.itemPrice}>
                                                R$ {Number(item.product.price).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <h3 style={styles.total}>Total: R$ {valorFinal.toFixed(2).replace('.', ',')}</h3>

                                <div style={styles.actions}>
                                    <button style={styles.buttonAdd} onClick={handleOpenAddMode}>
                                        <FiPlus size={20} /> Lançar Produto
                                    </button>
                                    <button style={styles.buttonCloseTable} onClick={() => setIsClosing(true)}>
                                        <FiCheckSquare size={20} /> Fechar Conta
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

            </div>
        </Modal>
    );
}

const styles = {
    closeButton: { background: 'transparent', border: 'none', cursor: 'pointer', float: 'right' as const },
    container: { display: 'flex', flexDirection: 'column' as const, marginTop: '10px' },
    title: { fontSize: '24px', color: '#FFF' },
    clientButton: { backgroundColor: '#1d1d2e', border: '1px solid #3fffa3', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
    clientNameBtn: { color: '#FFF', fontSize: '18px', fontWeight: 'bold' },
    headerDetail: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    backButton: { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' },
    itemsList: { backgroundColor: '#1d1d2e', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column' as const, gap: '10px', maxHeight: '250px', overflowY: 'auto' as const, marginBottom: '10px' },
    item: { display: 'flex', justifyContent: 'space-between', color: '#FFF', fontSize: '18px', borderBottom: '1px solid #333', paddingBottom: '8px' },
    itemQtd: { color: '#3fffa3', fontWeight: 'bold', width: '30px' },
    itemName: { flex: 1 },
    itemPrice: { fontWeight: 'bold' },
    total: { fontSize: '24px', color: '#3fffa3', textAlign: 'right' as const },
    actions: { display: 'flex', gap: '15px', marginTop: '20px' },
    buttonAdd: { flex: 1, backgroundColor: 'transparent', border: '2px solid #3fffa3', color: '#3fffa3', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    buttonCloseTable: { flex: 1, backgroundColor: '#ff3f4b', border: 'none', color: '#FFF', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    addForm: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    label: { color: '#FFF', fontSize: '16px', marginTop: '10px' },
    select: { width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', padding: '0 10px', fontSize: '16px' },
    input: { width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', padding: '0 10px', fontSize: '16px' },
    buttonConfirmAdd: { marginTop: '20px', backgroundColor: '#3fffa3', border: 'none', color: '#101026', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};