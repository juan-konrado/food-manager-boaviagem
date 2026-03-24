import { useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import { Header } from '../../components/Header';

export default function Category() {
    const [name, setName] = useState('');

    async function handleRegister(event: FormEvent) {
        event.preventDefault();

        if (name.trim() === '') {
            alert('Digite o nome da categoria!');
            return;
        }

        try {
            await api.post('/category', {
                name: name
            });

            alert('Categoria cadastrada com sucesso!');
            setName('');
        } catch (err) {
            console.log(err);
            alert('Erro ao cadastrar categoria.');
        }
    }

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>
                    <h1 style={styles.title}>Cadastrar Categoria</h1>

                    <form onSubmit={handleRegister} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Ex: Cervejas, Drinks, Porções..."
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button type="submit" style={styles.button}>
                            Cadastrar
                        </button>
                    </form>
                </main>
            </div>
        </>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1d1d2e' },
    main: { backgroundColor: '#101026', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '600px', border: '1px solid #8a8a8a' },
    title: { color: '#FFF', fontSize: '32px', marginBottom: '24px', textAlign: 'center' as const },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
    input: { height: '50px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '0 16px', fontSize: '18px' },
    button: { height: '50px', backgroundColor: '#3fffa3', color: '#101026', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }
};