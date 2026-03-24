import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderRequest {
    order_id: string;
    payment_method: string; // <-- Agora ele pede o pagamento!
}

class FinishOrderService {
    async execute({ order_id, payment_method }: OrderRequest) {
        const order = await prisma.order.update({
            where: {
                id: order_id
            },
            data: {
                status: 'COMPLETED',
                closedAt: new Date(),
                paymentMethod: payment_method // <-- Salva no banco!
            }
        });

        return order;
    }
}

export { FinishOrderService }