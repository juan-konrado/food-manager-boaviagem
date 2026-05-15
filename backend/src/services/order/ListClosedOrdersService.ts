import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ListClosedOrdersService {
    async execute() {
        const orders = await prisma.order.findMany({
            where: {
                status: 'COMPLETED'
            },
            orderBy: {
                updatedAt: 'desc' 
            },
            include: {
                table: true, 
                // 🟢 MÁGICA: Traz os itens pedidos e os dados do produto (nome, preço)
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        return orders;
    }
}

export { ListClosedOrdersService }