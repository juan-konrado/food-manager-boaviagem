import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderRequest {
  table_id?: string; // Opcional, pois pode ser um pedido de balcão
  name?: string;     // Nome do cliente (opcional)
}

class CreateOrderService {
  async execute({ table_id, name }: OrderRequest){
  
    const order = await prisma.order.create({
      data: {
        tableId: table_id,
        // Como não colocamos campo "name" no banco na Order, 
        // por enquanto vamos criar apenas o registro vazio (Rascunho)
        status: 'DRAFT', // Começa como Rascunho
      }
    })

    return order;
  }
}

export { CreateOrderService }