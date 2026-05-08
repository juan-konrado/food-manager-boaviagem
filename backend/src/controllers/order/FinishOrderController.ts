import { Request, Response } from 'express';
import { FinishOrderService } from '../../services/order/FinishOrderService';
import { io } from '../../server';

class FinishOrderController {
    async handle(req: Request, res: Response) {
        // 1. Pegamos o que vem do Front-end
        const { order_id, payment_method, paymentMethod } = req.body;

        // 2. Pegamos o ID do garçom logado
        const user_id = req.user_id;

        const finishOrderService = new FinishOrderService();

        // 3. Executamos o serviço passando TUDO que ele pede (inclusive o user_id!)
        const order = await finishOrderService.execute({
            order_id,
            paymentMethod: paymentMethod || payment_method, // Cobre as duas formas de escrita
            user_id // 🟢 A CORREÇÃO ESTÁ AQUI!
        });

        // Os gritos do megafone
        io.emit('orders_updated');
        io.emit('finance_updated');

        return res.json(order);
    }
}

export { FinishOrderController };