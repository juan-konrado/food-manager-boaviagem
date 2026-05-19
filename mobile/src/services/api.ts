import axios from 'axios';

const api = axios.create({
    // O seu link do Ngrok
    baseURL: 'https://unenduringly-penalisable-terra.ngrok-free.dev',
    // O Crachá VIP que pula a tela de aviso do Ngrok:
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
})

export { api };