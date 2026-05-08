import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user_id = req.user_id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id
      }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Acesso negado. Apenas gerentes podem fazer isso." });
    }

    return next();

  } catch (err) {
    return res.status(500).json({ error: "Erro ao verificar permissões" });
  }
}