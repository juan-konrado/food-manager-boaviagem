import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ItemRequest {
  item_id: string; // O ID do item na comanda (não do produto!)
}

class RemoveItemService {
  async execute({ item_id }: ItemRequest){

    const order = await prisma.orderItem.delete({
      where: {
        id: item_id
      }
    })

    return order;
  }
}

export { RemoveItemService }