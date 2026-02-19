import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ItemRequest {
  order_id: string;
  product_id: string;
  amount: number; // Quantidade (Ex: 2 Coca-Colas)
}

class AddItemService {
  async execute({ order_id, product_id, amount }: ItemRequest){

    // Precisamos buscar o preço do produto para salvar no histórico
    // (Se o preço mudar amanhã, este pedido antigo não pode mudar o valor)
    const product = await prisma.product.findFirst({
        where: { id: product_id }
    })

    if(!product){
        throw new Error("Produto não encontrado")
    }

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order_id,
        productId: product_id,
        quantity: amount,
        price: product.price // Salvamos o preço ATUAL do produto
      }
    })

    return orderItem;
  }
}

export { AddItemService }