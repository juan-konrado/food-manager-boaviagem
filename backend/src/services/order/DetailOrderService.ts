import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DetailRequest {
  order_id: string;
}

class DetailOrderService {
  async execute({ order_id }: DetailRequest){

    const orders = await prisma.order.findFirst({
      where: {
        id: order_id
      },
      // A MÁGICA ACONTECE AQUI:
      include: {
        items: {
          include: {
            product: true // Dentro de cada item, traga os detalhes do produto (nome, foto)
          }
        }
      }
    })

    return orders;
  }
}

export { DetailOrderService }