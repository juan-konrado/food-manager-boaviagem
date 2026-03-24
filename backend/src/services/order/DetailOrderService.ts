import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DetailRequest {
  order_id: string;
}

class DetailOrderService {
  async execute({ order_id }: DetailRequest) {
    // Busca todos os itens que pertencem a esta comanda específica
    const items = await prisma.orderItem.findMany({
      where: {
        orderId: order_id // Aqui usamos o orderId que está no seu Prisma!
      },
      include: {
        product: true, // Traz os dados do produto (como o nome) junto!
        order: true
      }
    });

    return items;
  }
}

export { DetailOrderService }