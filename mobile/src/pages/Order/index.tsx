import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, FlatList, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { api } from '../../services/api';

type RouteDetailParams = {
    Order: {
        number: string | number;
        order_id: string;
        name?: string;
    }
}

export type CategoryProps = { id: string; name: string; }
export type ProductProps = { id: string; name: string; description: string; price: number; }
export type ItemProps = { id: string; product_id: string; name: string; amount: number; observation?: string; price: number; }

export default function Order() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { number, order_id, name } = route.params as RouteDetailParams['Order'];

    const [items, setItems] = useState<ItemProps[]>([]);
    const [hasNewItems, setHasNewItems] = useState(false);

    // Memórias dos Modais
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPaymentVisible, setModalPaymentVisible] = useState(false); // <-- NOVO MODAL

    const [categories, setCategories] = useState<CategoryProps[]>([]);
    const [categorySelected, setCategorySelected] = useState<CategoryProps | undefined>();
    const [products, setProducts] = useState<ProductProps[]>([]);

    const [productSelected, setProductSelected] = useState<ProductProps | undefined>();
    const [amount, setAmount] = useState(1);
    const [observation, setObservation] = useState('');

    useEffect(() => {
        loadOrderItems();
    }, [order_id]);

    async function loadOrderItems() {
        try {
            const response = await api.get('/order/detail', { params: { order_id } });
            const formattedItems = response.data.map((item: any) => ({
                id: item.id,
                product_id: item.productId,
                name: item.product.name,
                amount: item.quantity,
                observation: item.observation,
                price: Number(item.price)
            }));
            setItems(formattedItems);
        } catch (err) {
            console.log("Erro ao carregar itens da mesa", err);
        }
    }

    async function handleOpenModal() {
        setModalVisible(true);
        try {
            const response = await api.get('/category');
            setCategories(response.data);
            if (response.data.length > 0) {
                setCategorySelected(response.data[0]);
            }
        } catch (err) {
            console.log("Erro ao carregar categorias", err);
        }
    }

    useEffect(() => {
        async function loadProducts() {
            if (!categorySelected) return;
            try {
                const response = await api.get('/category/product', { params: { category_id: categorySelected.id } });
                setProducts(response.data);
            } catch (err) {
                console.log("Erro ao carregar produtos", err);
            }
        }
        loadProducts();
    }, [categorySelected]);

    async function handleAdd() {
        if (!productSelected) return;
        try {
            await api.post('/order/add', {
                order_id: order_id,
                product_id: productSelected.id,
                amount: amount,
                observation: observation
            });
            setHasNewItems(true);
            setProductSelected(undefined);
            setAmount(1);
            setObservation('');
            setModalVisible(false);
            loadOrderItems();
        } catch (err) {
            console.log("Erro ao adicionar produto", err);
            Alert.alert("Erro", "Não foi possível adicionar o produto.");
        }
    }

    async function handleDeleteItem(item_id: string) {
        try {
            await api.delete('/order/remove', { params: { item_id } });
            loadOrderItems();
        } catch (err) {
            console.log("Erro ao deletar item", err);
        }
    }

    function handleFinishOrder() {
        setHasNewItems(false);
        navigation.navigate('FinishOrder', { number, order_id });
    }

    const totalOrder = items.reduce((acumulador, item) => {
        return acumulador + (item.amount * item.price);
    }, 0);

    // --- NOVA FUNÇÃO: Com alerta de confirmação antes de fechar! ---
    function handleFinishWithPayment(method: string) {
        Alert.alert(
            "Pagamento Concluído ✅",
            `Deseja realmente fechar a comanda no ${method}?`,
            [
                {
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        try {
                            // Só bate no banco de dados se ele clicar em "Sim"
                            await api.put('/order/finish', {
                                order_id: order_id,
                                payment_method: method
                            });

                            setModalPaymentVisible(false);
                            navigation.popToTop(); // Volta pro mapa de mesas

                        } catch (err) {
                            console.log("Erro ao fechar conta", err);
                            Alert.alert("Erro", "Não foi possível fechar a conta.");
                        }
                    }
                }
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerTexts}>
                    <Text style={styles.title}>Mesa {number}</Text>
                    {name && <Text style={styles.clientName}>{name}</Text>}
                </View>

                <View style={{ width: 28 }} />
            </View>

            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total da Comanda</Text>
                <Text style={styles.totalValue}>R$ {totalOrder.toFixed(2).replace('.', ',')}</Text>
            </View>

            {items.length === 0 && <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 20 }}>Comanda vazia</Text>}

            <FlatList
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, marginTop: 15 }}
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemText}>{item.amount}x {item.name}</Text>
                            {item.observation ? <Text style={styles.itemObservation}>Obs: {item.observation}</Text> : null}
                            <Text style={styles.itemPriceSub}>R$ {(item.amount * item.price).toFixed(2).replace('.', ',')}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                            <Feather name="trash-2" size={28} color="#FF3F4b" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.buttonAdd} onPress={handleOpenModal}>
                    <Feather name="plus-circle" size={24} color="#101026" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonTextAdd}>ADICIONAR PRODUTO</Text>
                </TouchableOpacity>

                {hasNewItems && (
                    <TouchableOpacity style={styles.buttonFinish} onPress={handleFinishOrder}>
                        <Text style={styles.buttonTextFinish}>Marcar como Entregue</Text>
                        <Feather name="check-circle" size={24} color="#FFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                )}

                {/* Agora o botão de Fechar Conta apenas abre o Modal de Pagamento */}
                {!hasNewItems && items.length > 0 && (
                    <TouchableOpacity style={styles.buttonCloseAccount} onPress={() => setModalPaymentVisible(true)}>
                        <Feather name="dollar-sign" size={24} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextCloseAccount}>Fechar Conta</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ========================================== */}
            {/* MODAL 1: ADICIONAR PRODUTOS                */}
            {/* ========================================== */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                {/* ... (Todo o código do modal de produtos que já fizemos continua igual aqui, mantive no arquivo para não quebrar) ... */}
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {!productSelected ? 'Catálogo' : 'Detalhes do Pedido'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setProductSelected(undefined);
                                setAmount(1);
                                setObservation('');
                            }}>
                                <Feather name="x-circle" size={32} color="#FF3F4b" />
                            </TouchableOpacity>
                        </View>

                        {!productSelected ? (
                            <>
                                <View style={{ height: 60, marginBottom: 15 }}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {categories.map(category => (
                                            <TouchableOpacity
                                                key={category.id}
                                                style={[styles.categoryButton, categorySelected?.id === category.id && styles.categoryButtonActive]}
                                                onPress={() => setCategorySelected(category)}
                                            >
                                                <Text style={[styles.categoryText, categorySelected?.id === category.id && styles.categoryTextActive]}>
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <FlatList
                                    data={products}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.productButton} onPress={() => setProductSelected(item)}>
                                            <Text style={styles.productName}>{item.name}</Text>
                                            <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={<Text style={{ color: '#8a8a8a', textAlign: 'center', marginTop: 20 }}>Nenhum produto cadastrado nesta categoria.</Text>}
                                />
                            </>
                        ) : (
                            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.selectedProductName}>{productSelected.name}</Text>

                                    <Text style={styles.label}>Quantidade</Text>
                                    <View style={styles.amountContainer}>
                                        <TouchableOpacity style={styles.amountButton} onPress={() => setAmount(amount > 1 ? amount - 1 : 1)}>
                                            <Feather name="minus" size={30} color="#FFF" />
                                        </TouchableOpacity>
                                        <Text style={styles.amountText}>{amount}</Text>
                                        <TouchableOpacity style={styles.amountButton} onPress={() => setAmount(amount + 1)}>
                                            <Feather name="plus" size={30} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.label}>Observação (Opcional)</Text>
                                    <TextInput
                                        placeholder="Ex: Sem cebola, com gelo e limão..."
                                        placeholderTextColor="#8a8a8a"
                                        style={styles.inputObservation}
                                        value={observation}
                                        onChangeText={setObservation}
                                        multiline
                                    />
                                </View>

                                <View style={styles.modalFooterActions}>
                                    <TouchableOpacity style={styles.buttonVoltar} onPress={() => setProductSelected(undefined)}>
                                        <Text style={styles.buttonTextVoltar}>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.buttonConfirmarAdd} onPress={handleAdd}>
                                        <Text style={styles.buttonTextConfirmarAdd}>Adicionar (R$ {(amount * productSelected.price).toFixed(2).replace('.', ',')})</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </View>
                </View>
            </Modal>

            {/* ========================================== */}
            {/* MODAL 2: FORMAS DE PAGAMENTO               */}
            {/* ========================================== */}
            <Modal animationType="fade" transparent={true} visible={modalPaymentVisible}>
                <View style={styles.modalPaymentContainer}>
                    <View style={styles.modalPaymentContent}>

                        <Text style={styles.modalPaymentTitle}>Forma de Pagamento</Text>
                        <Text style={styles.modalPaymentSub}>Total: R$ {totalOrder.toFixed(2).replace('.', ',')}</Text>

                        <View style={styles.paymentOptionsContainer}>
                            <TouchableOpacity style={styles.paymentBtn} onPress={() => handleFinishWithPayment('PIX')}>
                                <Feather name="hash" size={24} color="#101026" />
                                <Text style={styles.paymentBtnText}>PIX</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.paymentBtn} onPress={() => handleFinishWithPayment('Débito')}>
                                <Feather name="credit-card" size={24} color="#101026" />
                                <Text style={styles.paymentBtnText}>Débito</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.paymentBtn} onPress={() => handleFinishWithPayment('Crédito')}>
                                <Feather name="credit-card" size={24} color="#101026" />
                                <Text style={styles.paymentBtnText}>Crédito</Text>
                            </TouchableOpacity>

                            {/* Botão Fiado com cor de destaque */}
                            <TouchableOpacity style={[styles.paymentBtn, { backgroundColor: '#FF3F4b', borderWidth: 0 }]} onPress={() => handleFinishWithPayment('Fiado')}>
                                <Feather name="book-open" size={24} color="#FFF" />
                                <Text style={[styles.paymentBtnText, { color: '#FFF' }]}>Fiado</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.paymentCancelBtn} onPress={() => setModalPaymentVisible(false)}>
                            <Text style={styles.paymentCancelBtnText}>Cancelar e Voltar</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1d1d2e', padding: 20 },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 },
    backButton: { padding: 5 },
    headerTexts: { alignItems: 'center', flex: 1 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    clientName: { fontSize: 22, fontWeight: 'bold', color: '#3fffa3', marginTop: 4 },
    totalContainer: { backgroundColor: '#3fffa3', borderRadius: 8, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    totalLabel: { color: '#101026', fontSize: 20, fontWeight: 'bold' },
    totalValue: { color: '#101026', fontSize: 24, fontWeight: 'bold' },
    itemContainer: { backgroundColor: '#101026', borderRadius: 8, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#8a8a8a' },
    itemText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    itemObservation: { color: '#3fffa3', fontSize: 16, marginTop: 4 },
    itemPriceSub: { color: '#8a8a8a', fontSize: 16, marginTop: 4 },

    footerActions: { marginTop: 20, gap: 15, paddingBottom: 40 },
    buttonAdd: { backgroundColor: '#3fffa3', borderRadius: 8, height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonTextAdd: { color: '#101026', fontSize: 18, fontWeight: 'bold' },
    buttonFinish: { backgroundColor: '#101026', borderRadius: 8, height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3fffa3' },
    buttonTextFinish: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    buttonCloseAccount: { backgroundColor: '#FF3F4b', borderRadius: 8, height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonTextCloseAccount: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    // Estilos do Modal de Produtos
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1d1d2e', height: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 2, borderTopColor: '#3fffa3' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
    categoryButton: { backgroundColor: '#101026', paddingHorizontal: 20, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#8a8a8a' },
    categoryButtonActive: { backgroundColor: '#3fffa3', borderColor: '#3fffa3' },
    categoryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    categoryTextActive: { color: '#101026' },
    productButton: { backgroundColor: '#101026', padding: 20, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', flex: 1 },
    productPrice: { color: '#3fffa3', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    selectedProductName: { fontSize: 28, fontWeight: 'bold', color: '#3fffa3', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginBottom: 10 },
    amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, gap: 30 },
    amountButton: { backgroundColor: '#FF3F4b', width: 60, height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    amountText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
    inputObservation: { backgroundColor: '#101026', borderRadius: 8, padding: 15, fontSize: 18, color: '#FFF', borderWidth: 1, borderColor: '#8a8a8a', height: 100, textAlignVertical: 'top' },
    modalFooterActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    buttonVoltar: { flex: 1, height: 60, backgroundColor: '#101026', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#FF3F4b' },
    buttonTextVoltar: { color: '#FF3F4b', fontSize: 18, fontWeight: 'bold' },
    buttonConfirmarAdd: { flex: 2, height: 60, backgroundColor: '#3fffa3', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    buttonTextConfirmarAdd: { color: '#101026', fontSize: 18, fontWeight: 'bold' },

    // Estilos do Modal de Pagamento
    modalPaymentContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalPaymentContent: { backgroundColor: '#1d1d2e', width: '90%', borderRadius: 20, padding: 24, borderWidth: 2, borderColor: '#3fffa3' },
    modalPaymentTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 10 },
    modalPaymentSub: { fontSize: 28, fontWeight: 'bold', color: '#3fffa3', textAlign: 'center', marginBottom: 30 },
    paymentOptionsContainer: { gap: 15, marginBottom: 30 },
    paymentBtn: { backgroundColor: '#3fffa3', height: 60, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    paymentBtnText: { color: '#101026', fontSize: 20, fontWeight: 'bold' },
    paymentCancelBtn: { alignItems: 'center', marginTop: 10 },
    paymentCancelBtnText: { color: '#FF3F4b', fontSize: 18, fontWeight: 'bold' }
});