import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ItemRequest {
  order_id: string;
  product_id: string;
  amount: number;       // A quantidade (1x, 2x, etc.)
  observation?: string; // A nossa nova observação ("sem ervilha")
}

class AddItemService {
  async execute({ order_id, product_id, amount, observation }: ItemRequest) {

    // Primeiro, vamos buscar o preço atual do produto à base de dados
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Agora criamos o item na comanda com tudo o que precisamos!
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order_id,
        productId: product_id,
        quantity: amount,
        observation: observation,
        price: product.price // Guarda o preço que o produto tem hoje
      }
    });

    return orderItem;
  }
}

export { AddItemService }