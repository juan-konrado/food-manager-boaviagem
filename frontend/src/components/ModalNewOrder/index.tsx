import { useState } from 'react';
import Modal from 'react-modal';
import { FiX, FiCheckSquare } from 'react-icons/fi';
import { api } from '../../services/api';

interface ModalNewOrderProps {
    isOpen: boolean;
    onRequestClose: () => void;
    tableNumber: string | null;
    onSuccess: () => void; // Função para avisar a tela de fundo para dar um F5 nas mesas
}

const customStyles = {
    content: {
        top: '50%', bottom: 'auto', left: '50%', right: 'auto',
        padding: '30px', transform: 'translate(-50%, -50%)',
        backgroundColor: '#101026', border: '1px solid #3fffa3', // Borda verdinha!
        borderRadius: '8px', width: '100%', maxWidth: '400px', color: '#FFF'
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 999 }
};

export function ModalNewOrder({ isOpen, onRequestClose, tableNumber, onSuccess }: ModalNewOrderProps) {
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleOpenTable() {
        if (clientName === '') {
            alert("Por favor, digite o nome do cliente!");
            return;
        }

        setLoading(true);

        try {
            // 🟢 Faz a chamada para o Backend criar a comanda
            // Dependendo de como seu backend foi feito, pode ser que ele espere "table" ou "table_id"
            await api.post('/order', {
                table: Number(tableNumber), // Mandando o número da mesa
                name: clientName
            });

            alert(`Mesa ${tableNumber} aberta para ${clientName}!`);
            setClientName('');
            onSuccess(); // Manda o Balcão recarregar as mesas
            onRequestClose(); // Fecha essa janelinha

        } catch (err) {
            console.log(err);
            alert("Erro ao abrir a mesa. Olhe o console (F12)!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
            <button type="button" onClick={onRequestClose} style={styles.closeButton}>
                <FiX size={24} color="#ff3f4b" />
            </button>

            <div style={styles.container}>
                <h2 style={styles.title}>Abrir Mesa {tableNumber}</h2>
                <p style={{ color: '#8a8a8a', marginBottom: '20px' }}>Iniciando uma nova comanda</p>

                <label style={styles.label}>Nome do Cliente / Responsável</label>
                <input
                    type="text"
                    placeholder="Ex: João Silva"
                    style={styles.input}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    autoFocus
                />

                <button
                    style={styles.buttonConfirm}
                    onClick={handleOpenTable}
                    disabled={loading}
                >
                    <FiCheckSquare size={20} />
                    {loading ? 'Abrindo...' : 'Abrir Mesa'}
                </button>
            </div>
        </Modal>
    );
}

const styles = {
    closeButton: { background: 'transparent', border: 'none', cursor: 'pointer', float: 'right' as const },
    container: { display: 'flex', flexDirection: 'column' as const },
    title: { fontSize: '24px', color: '#FFF' },
    label: { color: '#FFF', fontSize: '16px', marginBottom: '8px' },
    input: { width: '100%', height: '45px', borderRadius: '8px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', padding: '0 15px', fontSize: '16px', marginBottom: '20px' },
    buttonConfirm: { backgroundColor: '#3fffa3', border: 'none', color: '#101026', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};