import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


class RemoveOrderService {
    async execute({ order_id }: { order_id: string }) {
        const order = await prisma.order.delete({
            where: {
                id: order_id,
            }
        })
        return order;
    }
}

export { RemoveOrderService }