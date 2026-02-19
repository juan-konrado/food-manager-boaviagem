import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs'; // <--- Importamos o hash

const prisma = new PrismaClient();

export class UserController {
    async handleList(req: Request, res: Response) {
        const users = await prisma.user.findMany();
        return res.json(users);
    }

    async handleCreate(req: Request, res: Response) {
        const { name, email, password } = req.body;

        // 1. Verifica se já existe
        const userAlreadyExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userAlreadyExists) {
            return res.status(400).json({ error: "Usuário já existe" });
        }

        // 2. Criptografa a senha (O número 8 é a força da criptografia)
        const passwordHash = await hash(password, 8);

        // 3. Cria o usuário com a senha CRIPTOGRAFADA
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash, // <--- Salvamos o hash, não a senha pura
            },
            select: {
                id: true,
                name: true,
                email: true,
                // Não retornamos a senha nem o hash para quem pediu, por segurança
            }
        });

        return res.json(user);
    }

    async detail(req: Request, res: Response) {
        const user_id = req.user_id; // Pegamos o ID que o middleware injetou

        const user = await prisma.user.findFirst({
            where: {
                id: user_id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })

        return res.json(user);
    }
}