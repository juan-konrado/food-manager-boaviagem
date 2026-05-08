import { useState, type FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

export default function SignIn() {
    const { signIn } = useContext(AuthContext); // Puxa a função do nosso cérebro!
    const navigate = useNavigate(); // O motorista do nosso GPS

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Para o botão não ser clicado 2x

    async function handleLogin(event: FormEvent) {
        event.preventDefault();

        if (email === '' || password === '') {
            alert('Preencha todos os campos!');
            return;
        }

        setLoading(true);

        try {
            // Manda os dados para o AuthContext
            await signIn({
                email,
                password
            });

            // Se deu certo, o GPS joga o usuário para a tela de Produtos!
            navigate('/home');

        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>

                <h1 style={styles.logo}>
                    Boa Viagem <span style={{ color: '#3fffa3' }}>Pub</span>
                </h1>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Digite seu email"
                        style={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Sua senha secreta"
                        style={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Carregando...' : 'Acessar Painel'}
                    </button>
                </form>

            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1d1d2e' },
    content: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '400px', padding: '20px' },
    logo: { color: '#FFF', fontSize: '48px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' as const },
    form: { display: 'flex', flexDirection: 'column' as const, width: '100%', gap: '15px' },
    input: { height: '50px', backgroundColor: '#101026', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '0 16px', fontSize: '18px' },
    button: { height: '50px', backgroundColor: '#3fffa3', color: '#101026', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};