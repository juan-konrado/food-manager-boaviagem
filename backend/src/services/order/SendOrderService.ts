import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderRequest {
  order_id: string;
}

class SendOrderService {
  async execute({ order_id }: OrderRequest){
    
    // O comando UPDATE precisa do 'where' (quem atualizar) e 'data' (o que mudar)
    const order = await prisma.order.update({
      where: {
        id: order_id
      },
      data: {
        status: 'WAITING' // Muda de Rascunho para Aguardando
      }
    })

    return order;
  }
}

export { SendOrderService }