import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class GetSalesService {
    async execute() {
        // 1. Busca os pedidos finalizados (se tem data de fechamento, é porque foi pago!)
        const orders = await prisma.order.findMany({
            where: {
                closedAt: {
                    not: null
                }
            },
            // Trazemos os itens por segurança caso o total esteja zerado no banco
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const salesByDate: Record<string, number> = {};

        orders.forEach(order => {
            // Só processa se realmente tiver uma data de fechamento
            if (order.closedAt) {
                // Pega a data que o caixa fechou a comanda
                const date = order.closedAt.toISOString().split('T')[0];

                // Usa a sua coluna 'total' do banco! 
                let orderTotal = Number(order.total);

                // Trava de Segurança: Se o 'total' estiver 0, calculamos os produtos na hora
                if (orderTotal === 0 && order.items) {
                    orderTotal = order.items.reduce((acc, item) => {
                        return acc + (Number(item.product.price) * item.quantity);
                    }, 0);
                }

                if (salesByDate[date]) {
                    salesByDate[date] += orderTotal;
                } else {
                    salesByDate[date] = orderTotal;
                }
            }
        });

        const result = Object.keys(salesByDate).map(date => {
            return {
                date: date,
                total: salesByDate[date]
            }
        });

        return result;
    }
}

export { GetSalesService }