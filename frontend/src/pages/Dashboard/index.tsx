import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { FiAlertCircle, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { io } from 'socket.io-client';

const DESPESAS = {
    barFixas: 6000 + 1600 + 300 + 150 + 300 + 150 + 600, // 9100
    barVariaveis: (3000 + 3000 + 1000 + 500) * 4 + 500,  // 30500
    barLimpeza: 250 + 32 + 30 + 100 + 60 + 100,          // 572
    casaFixas: 2700 + 250 + 150 + 100 + 150 + 500 + 1200 + 500 + 250 + 400 + (480 * 4) // 8120
};

const CUSTO_TOTAL_MES = DESPESAS.barFixas + DESPESAS.barVariaveis + DESPESAS.barLimpeza + DESPESAS.casaFixas; // R$ 48.292

type Venda = {
    data: Date;
    valor: number;
}

export default function Dashboard() {
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [vendasReais, setVendasReais] = useState<Venda[]>([]);

    // 🟢 Criamos a função aqui fora para poder ser chamada várias vezes!
    async function loadSales() {
        try {
            const response = await api.get('/sales');

            const vendasFormatadas = response.data.map((item: { date: string, total: number }) => {
                const [year, month, day] = item.date.split('-');
                return {
                    data: new Date(Number(year), Number(month) - 1, Number(day)),
                    valor: item.total
                }
            });

            setVendasReais(vendasFormatadas);
        } catch (err) {
            console.log("Erro ao carregar faturamento", err);
        }
    }

    // 1. Busca os dados no Backend assim que a tela abre
    useEffect(() => {
        loadSales();
    }, []);

    // ==========================================
    // 🟢 NOSSO RADINHO A ESCUTAR O DINHEIRO AO VIVO
    // ==========================================
    useEffect(() => {
        const socket = io('http://localhost:3333');

        socket.on('finance_updated', () => {
            console.log("💰 Dinheiro novo no caixa! A atualizar o painel...");
            loadSales(); // Chama a função novamente para atualizar o gráfico!
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Fazemos os cálculos usando o 'vendasReais' agora
    const faturamentoMesAtual = vendasReais.reduce((acc, venda) => acc + venda.valor, 0);
    const lucroLiquido = faturamentoMesAtual - CUSTO_TOTAL_MES;
    const noVermelho = lucroLiquido < 0;

    function calcularVendasSelecionadas() {
        if (!dateRange) return 0;
        const [start, end] = dateRange;

        return vendasReais.reduce((total, venda) => {
            if (venda.data >= start && venda.data <= end) {
                return total + venda.valor;
            }
            return total;
        }, 0);
    }

    function renderTileContent({ date, view }: any) {
        if (view === 'month') {
            const vendaDia = vendasReais.find(v => isSameDay(v.data, date));
            if (vendaDia) {
                return <p style={styles.valorDia}>R$ {vendaDia.valor}</p>;
            }
        }
        return null;
    }

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>
                    <h1 style={styles.title}>Gestão Financeira - Boa Viagem</h1>

                    <div style={styles.cardsGrid}>
                        <div style={styles.card}>
                            <span style={styles.cardTitle}>Faturamento (Mês)</span>
                            <h2 style={styles.cardValue}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoMesAtual)}
                            </h2>
                            <span style={styles.cardSubtitle}>Meta de Equilíbrio: R$ {CUSTO_TOTAL_MES}</span>
                        </div>

                        <div style={styles.card}>
                            <span style={styles.cardTitle}>Custo Total (Bar + Casa)</span>
                            <h2 style={{ ...styles.cardValue, color: '#ff3f4b' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(CUSTO_TOTAL_MES)}
                            </h2>
                            <span style={styles.cardSubtitle}>Inclui fixos, variáveis e pessoal</span>
                        </div>

                        <div style={{ ...styles.card, backgroundColor: noVermelho ? '#3a1015' : '#103a20', borderColor: noVermelho ? '#ff3f4b' : '#3fffa3' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={styles.cardTitle}>{noVermelho ? 'Prejuízo Atual' : 'Lucro Líquido'}</span>
                                {noVermelho ? <FiAlertCircle color="#ff3f4b" size={24} /> : <FiCheckCircle color="#3fffa3" size={24} />}
                            </div>
                            <h2 style={{ ...styles.cardValue, color: noVermelho ? '#ff3f4b' : '#3fffa3' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroLiquido)}
                            </h2>
                            <span style={styles.cardSubtitle}>
                                {noVermelho ? 'Ainda não batemos as contas do mês.' : 'Já pagamos tudo! Isso é lucro.'}
                            </span>
                        </div>
                    </div>

                    <div style={styles.calendarSection}>
                        <div style={styles.calendarHeader}>
                            <h2><FiCalendar /> Calendário de Faturamento</h2>
                            <p>Selecione um período (arrastando ou clicando em dois dias) para ver a soma total.</p>
                        </div>

                        <div style={styles.calendarLayout}>
                            <div style={styles.calendarWrapper}>
                                <Calendar
                                    onChange={(value) => setDateRange(value as [Date, Date])}
                                    selectRange={true}
                                    tileContent={renderTileContent}
                                    locale="pt-BR"
                                    className="meu-calendario-pub"
                                />
                            </div>

                            <div style={styles.selectionResult}>
                                <h3>Faturamento no Período</h3>
                                {dateRange ? (
                                    <>
                                        <p style={styles.periodText}>
                                            De {format(dateRange[0], "dd 'de' MMMM", { locale: ptBR })} <br />
                                            até {format(dateRange[1], "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <h1 style={styles.totalPeriodo}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularVendasSelecionadas())}
                                        </h1>
                                    </>
                                ) : (
                                    <p style={{ color: '#8a8a8a', marginTop: '20px' }}>Selecione dias no calendário para calcular.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '40px 20px' },
    main: { width: '100%', maxWidth: '1200px' },
    title: { color: '#FFF', fontSize: '32px', marginBottom: '30px' },
    cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' },
    card: { backgroundColor: '#101026', padding: '24px', borderRadius: '8px', border: '1px solid #8a8a8a', display: 'flex', flexDirection: 'column' as const },
    cardTitle: { color: '#8a8a8a', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' },
    cardValue: { color: '#FFF', fontSize: '32px', marginBottom: '8px' },
    cardSubtitle: { color: '#8a8a8a', fontSize: '14px' },
    calendarSection: { backgroundColor: '#101026', padding: '30px', borderRadius: '8px', border: '1px solid #8a8a8a' },
    calendarHeader: { color: '#FFF', marginBottom: '20px' },
    calendarLayout: { display: 'flex', gap: '40px', flexWrap: 'wrap' as const },
    calendarWrapper: { flex: 2, minWidth: '300px' },
    selectionResult: { flex: 1, minWidth: '250px', backgroundColor: '#1d1d2e', padding: '20px', borderRadius: '8px', border: '1px solid #3fffa3', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const },
    periodText: { color: '#FFF', fontSize: '18px', margin: '15px 0' },
    totalPeriodo: { color: '#3fffa3', fontSize: '40px' },
    valorDia: { fontSize: '10px', color: '#3fffa3', fontWeight: 'bold', marginTop: '5px' }
};