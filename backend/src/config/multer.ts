import crypto from 'crypto';
import multer from 'multer';
import { extname, resolve } from 'path';

export default {
    upload(folder: string) {
        return {
            storage: multer.diskStorage({
                // Resolve o caminho para encontrar a pasta 'tmp' lá na raiz do projeto
                destination: resolve(__dirname, '..', '..', folder),

                // Renomeia o arquivo para evitar nomes duplicados
                filename: (request, file, callback) => {
                    const fileHash = crypto.randomBytes(16).toString("hex");
                    const fileName = `${fileHash}-${file.originalname}`;

                    return callback(null, fileName);
                }
            })
        }
    }
}