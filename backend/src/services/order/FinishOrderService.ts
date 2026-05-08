import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderRequest {
    order_id: string;
    paymentMethod: string;
    user_id: string;
}

class FinishOrderService {
    async execute({ order_id, paymentMethod, user_id }: OrderRequest) {

        // Busca o nome do garçom no banco de dados usando o ID
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        // Atualiza a comanda
        const order = await prisma.order.update({
            where: { id: order_id },
            data: {
                status: 'COMPLETED',
                closedAt: new Date(),
                paymentMethod: paymentMethod,
                waiter_name: user?.name // 🟢 A CORREÇÃO ESTÁ AQUI (O sinal de ":" é obrigatório!)
            }
        });

        return order;
    }
}

export { FinishOrderService };