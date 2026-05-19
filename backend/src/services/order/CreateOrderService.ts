import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderRequest {
  table: number;
  name?: string;
  waiterId: string; 
}

class CreateOrderService {
  async execute({ table, name, waiterId }: OrderRequest) {
    
    // 1. Busca o nome do usuário que está logado no sistema
    const user = await prisma.user.findUnique({
        where: { id: waiterId }
    });

    const order = await prisma.order.create({
      data: {
        name: name,
        waiter_name: user?.name,
        
        // 🟢 A CORREÇÃO ESTÁ AQUI: Usando o formato de Relação (connect) igual a mesa!
        waiter: {
          connect: {
            id: waiterId
          }
        },
        
        // Conecta o pedido à Mesa
        table: {
          connectOrCreate: {
            where: { number: table }, 
            create: { number: table } 
          }
        }
      }
    });

    return order;
  }
}

export { CreateOrderService }