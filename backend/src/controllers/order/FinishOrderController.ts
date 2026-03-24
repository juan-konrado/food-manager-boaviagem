import { Request, Response } from 'express';
import { FinishOrderService } from '../../services/order/FinishOrderService';

class FinishOrderController {
    async handle(req: Request, res: Response) {
        // Recebe o método de pagamento que vem do celular
        const { order_id, payment_method } = req.body;

        const finishOrderService = new FinishOrderService();

        const order = await finishOrderService.execute({
            order_id,
            payment_method
        });

        return res.json(order);
    }
}

export { FinishOrderController }