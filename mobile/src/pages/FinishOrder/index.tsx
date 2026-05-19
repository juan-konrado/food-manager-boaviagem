import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { api } from '../../services/api';

type RouteDetailParams = {
    FinishOrder: {
        number: string | number;
        order_id: string;
    }
}

export default function FinishOrder() {
    const route = useRoute();
    const navigation = useNavigation<any>();

    // Pegamos a bagagem que veio da tela anterior
    const { number, order_id } = route.params as RouteDetailParams['FinishOrder'];

    // A função que manda o pedido para a cozinha de verdade!
    async function handleFinish() {
        try {
            // Bate na rota PUT que criamos no backend para mudar o status da mesa
            await api.put('/order/send', {
                order_id: order_id
            });

            // O popToTop() destrói todas as telas abertas e joga o garçom direto pro Dashboard inicial!
            navigation.popToTop();

        } catch (err) {
            console.log("Erro ao finalizar, ", err);
            Alert.alert("Erro", "Não foi possível finalizar o pedido.");
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <AlertBox />
            <Text style={styles.alert}>Confirmar produtos na comanda?</Text>
            <Text style={styles.title}>Mesa {number}</Text>

            <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.textButton}>Marcar como Entregue</Text>
                <Feather name="check-circle" size={20} color="#1d1d2e" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Um componentezinho visual pra deixar a tela bonita
function AlertBox() {
    return <Feather name="alert-circle" size={45} color="#FF3F4b" style={{ marginBottom: 12 }} />
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1d1d2e', paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
    alert: { fontSize: 20, color: '#FFF', fontWeight: 'bold', marginBottom: 12 },
    title: { fontSize: 30, fontWeight: 'bold', color: '#FFF', marginBottom: 24 },
    button: { backgroundColor: '#3fffa3', flexDirection: 'row', width: '65%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
    textButton: { fontSize: 18, marginRight: 8, fontWeight: 'bold', color: '#1d1d2e' }
});