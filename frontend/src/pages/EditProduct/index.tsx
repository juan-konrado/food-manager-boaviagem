import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../services/api';
import { Header } from '../../components/Header';

type CategoryProps = { id: string; name: string; }
type ProductProps = { id: string; name: string; price: string; description: string; banner: string; }

export default function EditProduct() {
    const [categories, setCategories] = useState<CategoryProps[]>([]);
    const [categorySelected, setCategorySelected] = useState('');

    const [products, setProducts] = useState<ProductProps[]>([]);
    const [productSelected, setProductSelected] = useState('');

    // Campos do formulário
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    // Imagens
    const [avatarUrl, setAvatarUrl] = useState('');
    const [imageAvatar, setImageAvatar] = useState<File | null>(null);

    // 1. Carrega as Categorias ao abrir a tela
    useEffect(() => {
        async function loadCategories() {
            const response = await api.get('/category');
            setCategories(response.data);
            if (response.data.length > 0) {
                setCategorySelected(response.data[0].id);
            }
        }
        loadCategories();
    }, []);

    // 2. Carrega os Produtos sempre que a Categoria mudar
    useEffect(() => {
        async function loadProducts() {
            if (!categorySelected) return;

            const response = await api.get('/category/product', {
                params: { category_id: categorySelected }
            });

            setProducts(response.data);

            // Limpa a tela se trocar de categoria
            setProductSelected('');
            setName('');
            setPrice('');
            setDescription('');
            setAvatarUrl('');
            setImageAvatar(null);
        }
        loadProducts();
    }, [categorySelected]);

    // 3. Preenche os dados quando um Produto é selecionado
    function handleSelectProduct(e: ChangeEvent<HTMLSelectElement>) {
        const selectedId = e.target.value;
        setProductSelected(selectedId);

        const product = products.find(p => p.id === selectedId);
        if (product) {
            setName(product.name);
            setPrice(product.price);
            setDescription(product.description);
            // Puxa a foto antiga lá da nossa "Vitrine" do Backend
            setAvatarUrl(`http://localhost:3333/files/${product.banner}`);
            setImageAvatar(null); // Reseta o arquivo novo, caso ele não queira trocar a foto
        }
    }

    // 4. Preview da Nova Foto (se ele quiser trocar)
    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const image = e.target.files[0];
        if (!image) return;

        if (image.type === 'image/jpeg' || image.type === 'image/png') {
            setImageAvatar(image);
            setAvatarUrl(URL.createObjectURL(image));
        }
    }

    // 5. Envia as atualizações para o Backend (O nosso PUT)
    async function handleUpdate(event: FormEvent) {
        event.preventDefault();

        if (!productSelected) {
            alert("Selecione um produto para editar!");
            return;
        }

        try {
            const data = new FormData();
            data.append('product_id', productSelected);
            data.append('name', name);
            data.append('price', String(price).replace(',', '.'));
            data.append('description', description);

            // Só envia a foto se ele selecionou uma nova
            if (imageAvatar) {
                data.append('file', imageAvatar);
            }

            await api.put('/product', data);
            alert('Produto atualizado com sucesso no cardápio!');

        } catch (err) {
            console.log(err);
            alert('Erro ao atualizar produto!');
        }
    }

    async function handleDeleteProduct() {
        if (!productSelected) return;

        // Trava de segurança para não excluir sem querer com um clique duplo
        const confirmDelete = window.confirm("Tem certeza absoluta que deseja excluir este produto do cardápio?");

        if (confirmDelete) {
            try {
                await api.delete('/product', {
                    params: {
                        product_id: productSelected
                    }
                });

                alert("Produto excluído com sucesso!");
                window.location.reload(); // Recarrega a página para limpar a tela

            } catch (err) {
                console.log(err);
                alert("Erro ao excluir produto.");
            }
        }
    }

    return (
        <>
            <Header />
            <div style={styles.container}>
                <main style={styles.main}>
                    <h1 style={styles.title}>Editar Produto</h1>

                    <form onSubmit={handleUpdate} style={styles.form}>

                        {/* Escolher a Categoria */}
                        <select value={categorySelected} onChange={(e) => setCategorySelected(e.target.value)} style={styles.input}>
                            <option value="" disabled>Selecione a Categoria</option>
                            {categories.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>

                        {/* Escolher o Produto da Categoria */}
                        <select value={productSelected} onChange={handleSelectProduct} style={styles.input}>
                            <option value="" disabled>Selecione o Produto para editar</option>
                            {products.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>

                        {productSelected && (
                            <>
                                <label style={styles.labelAvatar}>
                                    <span style={styles.uploadText}>
                                        <i data-feather="upload"></i> Mudar Foto?
                                    </span>
                                    <input type="file" accept="image/png, image/jpeg" onChange={handleFile} style={{ display: 'none' }} />
                                    {avatarUrl && <img src={avatarUrl} alt="Foto do produto" style={styles.preview} />}
                                </label>

                                <input type="text" placeholder="Nome" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                                <input type="text" placeholder="Preço" style={styles.input} value={price} onChange={(e) => setPrice(e.target.value)} />
                                <textarea placeholder="Descrição" style={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ ...styles.button, flex: 1 }}>
                                        Salvar Alterações
                                    </button>

                                    <button type="button" onClick={handleDeleteProduct} style={{ ...styles.button, flex: 1, backgroundColor: '#ff3f4b', color: '#FFF' }}>
                                        Excluir Produto
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </main>
            </div>
        </>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#1d1d2e', padding: '40px 20px' },
    main: { backgroundColor: '#101026', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '700px', border: '1px solid #8a8a8a' },
    title: { color: '#FFF', fontSize: '32px', marginBottom: '24px', textAlign: 'center' as const },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
    labelAvatar: { width: '100%', height: '250px', backgroundColor: '#1d1d2e', border: '2px dashed #8a8a8a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative' as const, overflow: 'hidden' as const },
    uploadText: { color: '#8a8a8a', fontSize: '20px', position: 'absolute' as const, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' },
    preview: { width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: 2 },
    input: { height: '50px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '0 16px', fontSize: '18px' },
    textarea: { height: '120px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '16px', fontSize: '18px', resize: 'none' as const },
    button: { height: '50px', backgroundColor: '#3fffa3', color: '#101026', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};