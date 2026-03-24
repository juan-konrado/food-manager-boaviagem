import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ListOrdersService {
    async execute() {
        // Busca todos os pedidos, EXCETO os que já foram pagos (COMPLETED) ou cancelados
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    notIn: ['COMPLETED', 'CANCELED'] // A mágica está aqui!
                }
            },
            include: {
                table: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    }
}

export { ListOrdersService }