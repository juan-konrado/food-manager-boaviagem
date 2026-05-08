import express from 'express';
import cors from 'cors';
import { router } from './routes'; // Importamos as rotas separadas
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

// Middlewares padrão
app.use(express.json());
app.use(cors());
app.use(router); // O servidor usa o arquivo de rotas
app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp')));

// ==========================================
// 🟢 CONFIGURAÇÃO DO WEBSOCKET (TEMPO REAL)
// ==========================================

// 1. Envelopamos o Express no servidor HTTP padrão do Node
const server = http.createServer(app);

// 2. Criamos o nosso "Megafone" (io) e liberamos o CORS para o Front-end e Mobile
export const io = new Server(server, {
  cors: {
    origin: '*', // Permite que a Web e o Mobile conectem sem bloqueios
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// 3. Ligamos o radar para ver quem conecta e desconecta
io.on('connection', (socket) => {
  console.log(`🔌 Um aparelho conectou ao vivo: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Aparelho desconectou: ${socket.id}`);
  });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = 3333;

// 🟢 ATENÇÃO: Agora quem "escuta" a porta é o 'server' (que tem o Express e o Socket juntos)
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com WebSockets ao vivo em http://localhost:${PORT}`);
});