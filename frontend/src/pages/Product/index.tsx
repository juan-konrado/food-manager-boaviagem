import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../services/api';
import { Header } from '../../components/Header';

type CategoryProps = {
    id: string;
    name: string;
}

export default function Product() {
    const [categories, setCategories] = useState<CategoryProps[]>([]);
    const [categorySelected, setCategorySelected] = useState('');

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [description, setDescription] = useState('');

    // Memórias para a Foto do Produto
    const [avatarUrl, setAvatarUrl] = useState('');
    const [imageAvatar, setImageAvatar] = useState<File | null>(null);

    // 1. Busca as categorias assim que a tela abre
    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await api.get('/category');
                setCategories(response.data);
                if (response.data.length > 0) {
                    setCategorySelected(response.data[0].id);
                }
            } catch (err) {
                console.log("Erro ao carregar categorias", err);
            }
        }
        loadCategories();
    }, []);

    // 2. Cria o Preview da imagem escolhida
    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === 'image/jpeg' || image.type === 'image/png') {
            setImageAvatar(image);
            setAvatarUrl(URL.createObjectURL(image)); // Cria uma URL temporária para mostrar na tela
        }
    }

    // 3. Envia os dados (Texto + Imagem) para o Backend
    async function handleRegister(event: FormEvent) {
        event.preventDefault();

        // 1. Tiramos o "!imageAvatar" daqui para não barrar o cadastro
        if (name === '' || price === '') {
            alert('Preencha pelo menos o nome e o preço!');
            return;
        }

        try {
            const data = new FormData();
            data.append('name', name);
            data.append('price', price.replace(',', '.'));
            data.append('cost_price', costPrice);
            data.append('description', description);
            data.append('category_id', categorySelected);

            // 2. Só anexa o arquivo se ele realmente existir!
            if (imageAvatar) {
                data.append('file', imageAvatar);
            }

            await api.post('/product', data);

            alert('Produto cadastrado com sucesso!');

            // Limpa a tela para o próximo produto
            setName('');
            setPrice('');
            setDescription('');
            setImageAvatar(null);
            setAvatarUrl('');

        } catch (err) {
            console.log(err);
            alert('Erro ao cadastrar produto!');
        }
    }



    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>
                    <h1 style={styles.title}>Novo Produto</h1>

                    <form onSubmit={handleRegister} style={styles.form}>

                        {/* Caixa de Foto */}
                        <label style={styles.labelAvatar}>
                            <span style={styles.uploadText}>
                                <i data-feather="upload"></i>
                            </span>
                            <input type="file" accept="image/png, image/jpeg" onChange={handleFile} style={{ display: 'none' }} />
                            {avatarUrl && (
                                <img src={avatarUrl} alt="Foto do produto" style={styles.preview} />
                            )}
                        </label>

                        {/* Selecionar Categoria */}
                        <select
                            value={categorySelected}
                            onChange={(e) => setCategorySelected(e.target.value)}
                            style={styles.input}
                        >
                            {categories.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {/* Nome e Preço */}
                        <input
                            type="text"
                            placeholder="Nome do produto"
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Preço de Custo (Ex: 5.00)"
                            style={styles.input}
                            value={costPrice}
                            onChange={(e) => setCostPrice(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Preço (Ex: 15,90)"
                            style={styles.input}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        {/* Observação / Ingredientes */}
                        <textarea
                            placeholder="Descreva o produto (Ex: Hambúrguer de 200g, queijo, bacon...)"
                            style={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <button type="submit" style={styles.button}>
                            Cadastrar Produto
                        </button>
                    </form>
                </main>
            </div>
        </>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '20px' },
    main: { backgroundColor: '#101026', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '700px', border: '1px solid #8a8a8a' },
    title: { color: '#FFF', fontSize: '32px', marginBottom: '24px', textAlign: 'center' as const },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },

    // Estilo da caixa de upload de imagem
    labelAvatar: { width: '100%', height: '250px', backgroundColor: '#1d1d2e', border: '2px dashed #8a8a8a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative' as const, overflow: 'hidden' as const },
    uploadText: { color: '#8a8a8a', fontSize: '30px', position: 'absolute' as const, zIndex: 1 },
    preview: { width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: 2 },

    input: { height: '50px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '0 16px', fontSize: '18px' },
    textarea: { height: '120px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '16px', fontSize: '18px', resize: 'none' as const },
    button: { height: '50px', backgroundColor: '#3fffa3', color: '#101026', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};