import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


interface OrderRequest {
  table: number;
  name?: string;
}

class CreateOrderService {
  async execute({ table, name }: OrderRequest) {
    // Agora nós usamos o superpoder de relacionamentos do Prisma!
    const order = await prisma.order.create({
      data: {
        name: name,
        // Conecta o pedido à Mesa real no banco de dados
        table: {
          connectOrCreate: {
            where: { number: table }, // Procura a mesa com esse número
            create: { number: table } // Se não achar, cria a mesa com esse número na hora!
          }
        }
      }
    });

    return order;
  }
}

export { CreateOrderService }