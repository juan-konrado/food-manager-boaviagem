import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';

// 🟢 IMPORTA O RADINHO DO SOCKET.IO
import { io } from 'socket.io-client';

export type OrderProps = {
  id: string;
  name: string | null;
  table: {
    number: number;
  }
}

export default function Dashboard() {
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [name, setName] = useState('');
  const [tableOrders, setTableOrders] = useState<OrderProps[]>([]);

  const mesas = Array.from({ length: 25 }, (_, i) => i + 1);
  const balcaoOrders = orders.filter(order => order.table?.number === 100);

  // 🟢 Separamos a função para poder chamá-la de vários lugares
  async function fetchOrders() {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.log("Erro ao buscar mesas", err);
    }
  }

  // Atualiza as mesas quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // ==========================================
  // 🟢 RADINHO DO GARÇOM (MOBILE) AO VIVO
  // ==========================================
  // ==========================================
  // 🟢 RADINHO DO GARÇOM (MOBILE) AO VIVO
  // ==========================================
  useEffect(() => {
    // ⚠️ MANTENHA O SEU IP AQUI ONDE ESTÁ O 192.168.X.X
    const socket = io('http://192.168.18.2:3333', {
      transports: ['websocket'], // 🟢 ISSO AQUI É O SEGREDO PRO REACT NATIVE!
    });

    // Aviso se conectou com sucesso
    socket.on('connect', () => {
      console.log("🟢 Celular CONECTADO ao rádio! ID:", socket.id);
    });

    // Aviso se deu erro
    socket.on('connect_error', (err) => {
      console.log("🔴 Celular NÃO conectou:", err.message);
    });

    // Escutando o grito de atualização
    socket.on('orders_updated', () => {
      console.log("📱 O celular ouviu o grito! Atualizando mesas...");
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleTableClick(numeroDaMesa: number) {
    const activeOrdersForThisTable = orders.filter(order => order.table?.number === numeroDaMesa);
    setTableOrders(activeOrdersForThisTable);
    setSelectedTable(String(numeroDaMesa));
    setModalVisible(true);
  }

  function navigateToExistingOrder(order_id: string, client_name: string | null, customTableLabel?: string) {
    setModalVisible(false);
    navigation.navigate('Order', {
      number: customTableLabel || selectedTable,
      order_id: order_id,
      name: client_name
    });
  }

  async function openNewOrder() {
    if (name.trim() === '') {
      Alert.alert("Nome Obrigatório", "Por favor, digite o nome do cliente!");
      return;
    }
    try {
      const response = await api.post('/order', {
        table: Number(selectedTable),
        name: name
      });
      setModalVisible(false);
      navigation.navigate('Order', {
        number: selectedTable === '100' ? 'Balcão' : selectedTable,
        order_id: response.data.id,
        name: name
      });
      setName('');
      setSelectedTable('');
    } catch (err) {
      Alert.alert("Erro", "Não foi possível abrir a comanda.");
      setModalVisible(false);
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = order.name?.toLowerCase().includes(searchLower);
    const tableMatch = String(order.table?.number).includes(searchLower);
    const balcaoMatch = searchLower === 'balcão' || searchLower === 'balcao';
    return nameMatch || tableMatch || (balcaoMatch && order.table?.number === 100);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boa Viagem Pub</Text>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Feather name="log-out" size={24} color="#ff3f4b" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: 20 }}>
        <Text style={styles.label}>Buscar Cliente ou Comanda ativa</Text>
        <View style={styles.inputContainer}>
          <Feather name="search" size={28} color="#8a8a8a" style={{ marginLeft: 15 }} />
          <TextInput
            placeholder="Ex: Guilherme, 10 ou Balcão"
            placeholderTextColor="#8a8a8a"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 15 }}>
              <Feather name="x" size={24} color="#ff3f4b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.divider}></View>

      {searchText !== '' ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultItem} onPress={() => {
              const label = item.table.number === 100 ? 'Balcão' : String(item.table.number);
              setSelectedTable(label);
              navigateToExistingOrder(item.id, item.name, label);
            }}>
              <Text style={styles.searchResultText}>
                {item.table.number === 100 ? 'Balcão' : `Mesa ${item.table.number}`}
              </Text>
              {item.name && <Text style={styles.searchResultName}>Cli: {item.name}</Text>}
              <Feather name="arrow-right" size={24} color="#3fffa3" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma comanda encontrada.</Text>}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* --- O NOVO BOTÃO GIGANTE DO BALCÃO --- */}
          <Text style={styles.mapTitle}>Balcão e Rua</Text>
          <TouchableOpacity
            style={[styles.balcaoCard, { backgroundColor: balcaoOrders.length > 0 ? '#ff3f4b' : '#3fffa3' }]}
            onPress={() => handleTableClick(100)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="users" size={32} color={balcaoOrders.length > 0 ? '#FFF' : '#101026'} />
              <View style={{ marginLeft: 15 }}>
                <Text style={[styles.balcaoCardTitle, { color: balcaoOrders.length > 0 ? '#FFF' : '#101026' }]}>
                  Comandas Avulsas
                </Text>
                <Text style={[styles.balcaoCardSub, { color: balcaoOrders.length > 0 ? '#FFF' : '#101026' }]}>
                  {balcaoOrders.length} pessoa(s) consumindo
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={32} color={balcaoOrders.length > 0 ? '#FFF' : '#101026'} />
          </TouchableOpacity>

          <View style={styles.divider}></View>

          <Text style={styles.mapTitle}>Mapa do Pub</Text>
          <View style={styles.gridContainer}>
            {mesas.map((mesa) => {
              const isOccupied = orders.some(order => order.table?.number === mesa);
              return (
                <TouchableOpacity
                  key={mesa}
                  style={[styles.tableSquare, { backgroundColor: isOccupied ? '#ff3f4b' : '#3fffa3' }]}
                  onPress={() => handleTableClick(mesa)}
                >
                  <Text style={[styles.tableText, { color: isOccupied ? '#FFF' : '#101026' }]}>{mesa}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

        </ScrollView>
      )}

      {/* --- O MODAL UNIFICADO --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <TouchableOpacity style={styles.closeModalButton} onPress={() => { setModalVisible(false); setName(''); }}>
              <Feather name="x" size={30} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {selectedTable === '100' ? 'Comandas do Balcão' : `Mesa ${selectedTable}`}
            </Text>

            {tableOrders.length > 0 && (
              <View style={{ maxHeight: 250, marginBottom: 15 }}>
                <Text style={styles.modalLabel}>Clientes Ativos:</Text>
                <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                  {tableOrders.map(order => (
                    <TouchableOpacity
                      key={order.id}
                      style={styles.existingOrderButton}
                      onPress={() => navigateToExistingOrder(order.id, order.name, selectedTable === '100' ? 'Balcão' : undefined)}
                    >
                      <Feather name="user" size={24} color="#101026" />
                      <Text style={styles.existingOrderText}>{order.name}</Text>
                      <Feather name="arrow-right" size={24} color="#101026" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.divider}></View>

            <Text style={styles.modalLabel}>
              {selectedTable === '100' ? 'Novo cliente no balcão:' : 'Novo cliente nesta mesa:'}
            </Text>
            <TextInput
              placeholder="Nome do Cliente"
              placeholderTextColor="#8a8a8a"
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={openNewOrder}>
              <Feather name="plus-circle" size={24} color="#101026" style={{ marginRight: 10 }} />
              <Text style={styles.modalButtonConfirmText}>Abrir Comanda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d1d2e', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  logoutButton: { padding: 10 },
  label: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#101026', borderRadius: 8, borderWidth: 1, borderColor: '#8a8a8a' },
  input: { flex: 1, height: 60, paddingHorizontal: 15, fontSize: 20, color: '#FFF' },
  divider: { height: 1, backgroundColor: '#8a8a8a', opacity: 0.3, marginBottom: 20, marginTop: 10 },
  mapTitle: { fontSize: 22, color: '#FFF', fontWeight: 'bold', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  tableSquare: { width: '22%', aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  tableText: { fontSize: 24, fontWeight: 'bold' },
  balcaoCard: { padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#101026' },
  balcaoCardTitle: { fontSize: 24, fontWeight: 'bold' },
  balcaoCardSub: { fontSize: 16, marginTop: 4 },
  searchResultItem: { backgroundColor: '#101026', padding: 20, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#3fffa3' },
  searchResultText: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  searchResultName: { fontSize: 18, color: '#8a8a8a', flex: 1, marginLeft: 15 },
  emptyText: { color: '#FFF', fontSize: 18, textAlign: 'center', marginTop: 30 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1d1d2e', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderTopColor: '#3fffa3', paddingBottom: 40 },
  closeModalButton: { position: 'absolute', top: 15, right: 15, zIndex: 99 },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  existingOrderButton: { backgroundColor: '#3fffa3', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  existingOrderText: { fontSize: 20, fontWeight: 'bold', color: '#101026', flex: 1, marginLeft: 10 },
  modalLabel: { fontSize: 18, color: '#8a8a8a', marginBottom: 10, fontWeight: 'bold' },
  modalInput: { height: 60, backgroundColor: '#101026', borderRadius: 8, paddingHorizontal: 20, fontSize: 20, color: '#FFF', borderWidth: 1, borderColor: '#8a8a8a', marginBottom: 20 },
  modalButtonConfirm: { height: 60, backgroundColor: '#3fffa3', borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalButtonConfirmText: { fontSize: 20, fontWeight: 'bold', color: '#101026' }
});