import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthController {
    async handle(req: Request, res: Response) {
        const { email, password } = req.body;

        // 1. Verificar se o e-mail existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: "E-mail ou senha incorretos" });
        }

        // 2. Verificar se a senha bate (compara a senha enviada com o hash do banco)
        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "E-mail ou senha incorretos" });
        }

        // 3. Gerar o Token JWT
        // O segredo "segredo-do-app" deve ir para o .env depois
        const token = sign(
            {
                name: user.name,
                email: user.email
            },
            "segredo-do-app",
            {
                subject: user.id,
                expiresIn: "30d" // O garçom só precisa logar 1 vez por mês
            }
        );

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: token
        });
    }
}