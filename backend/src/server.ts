import express from 'express';
import cors from 'cors';
import { router } from './routes'; // Importamos as rotas separadas
import path from 'path';

const app = express();


app.use(express.json());
app.use(cors());


app.use(router); // O servidor usa o arquivo de rotas

app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp')));

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});