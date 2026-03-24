import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3333'
});

// Resgata o token instantaneamente ao carregar a página
const token = localStorage.getItem('@boaviagem.token');

if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}