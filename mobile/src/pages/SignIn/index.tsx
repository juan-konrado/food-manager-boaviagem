import React, { useState, useContext } from 'react'; // Adicionamos useContext
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';

// Importamos o nosso Contexto e apagamos a importação da api e do AsyncStorage
import { AuthContext } from '../../contexts/AuthContext';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(false);

    // Puxamos a função de login do nosso cérebro!
    const { signIn } = useContext(AuthContext);

    async function handleLogin() {
        if (email === '' || password === '') {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }

        setLoadingAuth(true);

        try {
            // Chama a função que criamos no AuthContext!
            await signIn({
                email: email.trim().toLowerCase(),
                password: password
            });
            // AQUI NÃO TEM MAIS NAVEGAÇÃO! O routes/index.tsx faz isso sozinho agora.

        } catch (err: any) {
            Alert.alert("Ops, deu erro!", "E-mail ou senha incorretos");
        } finally {
            setLoadingAuth(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Food<Text style={{ color: '#ff3f4b' }}>Manager</Text></Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Digite seu email" style={styles.input} placeholderTextColor="#F0F0F0"
                    value={email} onChangeText={setEmail}
                />
                <TextInput
                    placeholder="Sua senha" style={styles.input} placeholderTextColor="#F0F0F0"
                    secureTextEntry={true} value={password} onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    {loadingAuth ? (
                        <ActivityIndicator size={25} color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Acessar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ... manter os styles iguais aqui embaixo
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1d1d2e', alignItems: 'center', justifyContent: 'center', padding: 20 },
    logo: { fontSize: 40, fontWeight: 'bold', color: '#FFF', marginBottom: 30 },
    inputContainer: { width: '95%', alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 14 },
    input: { width: '100%', height: 40, backgroundColor: '#101026', marginBottom: 12, borderRadius: 4, paddingHorizontal: 8, color: '#FFF', borderWidth: 1, borderColor: '#3fffa3' },
    button: { width: '100%', height: 40, backgroundColor: '#3fffa3', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#101026' }
});