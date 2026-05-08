import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { FiTrash2 } from 'react-icons/fi'; // Ícone de apagar

type CategoryProps = {
  id: string;
  name: string;
}

export default function Category() {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  // 1. Carrega as categorias assim que a página abre
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const response = await api.get('/category');
    setCategories(response.data);
  }

  // 2. Função para criar uma nova categoria
  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (name === '') return;

    try {
      await api.post('/category', { name: name });
      alert('Categoria registada com sucesso!');
      setName('');
      loadCategories(); // Atualiza a lista automaticamente após criar
    } catch (err) {
      console.log(err);
      alert('Erro ao registar a categoria.');
    }
  }

  // 3. Função para eliminar a categoria
  async function handleDeleteCategory(id: string, categoryName: string) {
    const confirmDelete = window.confirm(`Tem a certeza absoluta que deseja eliminar a categoria "${categoryName}"?`);
    
    if (confirmDelete) {
      try {
        await api.delete('/category', {
          params: { category_id: id }
        });
        
        alert('Categoria eliminada com sucesso!');
        loadCategories(); // Atualiza a lista removendo o item apagado
        
      } catch (err) {
        console.log(err);
        alert('Erro ao eliminar! Verifique se não existem produtos associados a esta categoria antes de a apagar.');
      }
    }
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <main style={styles.main}>
          <h1 style={styles.title}>Registar Categoria</h1>

          <form onSubmit={handleRegister} style={styles.form}>
            <input 
              type="text" 
              placeholder="Digite o nome da categoria"
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" style={styles.button}>
              Registar
            </button>
          </form>

          {/* Secção da Lista de Categorias */}
          {categories.length > 0 && (
            <>
              <h2 style={{ ...styles.title, marginTop: '40px', fontSize: '24px' }}>Categorias Registadas</h2>
              
              <div style={styles.list}>
                {categories.map(item => (
                  <div key={item.id} style={styles.listItem}>
                    <span style={styles.itemText}>{item.name}</span>
                    
                    <button onClick={() => handleDeleteCategory(item.id, item.name)} style={styles.deleteBtn} title="Eliminar categoria">
                      <FiTrash2 size={24} color="#ff3f4b" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

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
  input: { height: '50px', backgroundColor: '#1d1d2e', color: '#FFF', border: '1px solid #8a8a8a', borderRadius: '8px', padding: '0 16px', fontSize: '18px' },
  button: { height: '50px', backgroundColor: '#3fffa3', color: '#101026', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  list: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1d1d2e', padding: '15px', borderRadius: '8px', border: '1px solid #8a8a8a' },
  itemText: { color: '#FFF', fontSize: '18px' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};