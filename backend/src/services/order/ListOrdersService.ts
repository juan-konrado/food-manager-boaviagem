import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ListOrdersService {
    async execute() {
        // Busca todos os pedidos que ainda não foram finalizados
        const orders = await prisma.order.findMany({
            where: {
                status: 'DRAFT' // Traz só as mesas que o seu pai ainda está atendendo
            },
            include: {
                table: true // Puxa junto os dados da mesa (como o número dela)
            },
            orderBy: {
                createdAt: 'desc' // Traz os mais recentes primeiro
            }
        });

        return orders;
    }
}

export { ListOrdersService }