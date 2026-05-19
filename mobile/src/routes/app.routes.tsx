import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from '../pages/Dashboard';
import Order from '../pages/Order';
import FinishOrder from '../pages/FinishOrder'; // <-- IMPORTAMOS AQUI

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="Order" component={Order} options={{ headerShown: false }} />
            {/* ADICIONAMOS A TELA AQUI COM UM TÍTULO BONITO NO CABEÇALHO */}
            <Stack.Screen
                name="FinishOrder"
                component={FinishOrder}
                options={{
                    title: 'Finalizando',
                    headerStyle: { backgroundColor: '#1d1d2e' },
                    headerTintColor: '#FFF'
                }}
            />
        </Stack.Navigator>
    );
}