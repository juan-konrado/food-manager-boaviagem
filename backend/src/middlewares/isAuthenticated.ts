import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

interface Payload {
    sub: string; // O "subject" do token (que é o ID do usuário)
}

export function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. Receber o token (Vem no cabeçalho Authorization)
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).end(); // 401: Não autorizado
    }

    // 2. O token vem assim: "Bearer eyJhbGciOiJIUz..."
    // Vamos separar a palavra "Bearer" do token em si
    const [, token] = authToken.split(" ");

    try {
        // 3. Validar o token
        const { sub } = verify(
            token,
            "segredo-do-app" // Lembre-se: Depois isso vai pro .env
        ) as Payload;

        // 4. Recuperar o ID do token e colocar dentro do req
        req.user_id = sub;

        return next(); // Deixa passar pra próxima etapa

    } catch (err) {
        return res.status(401).end();
    }
}