import { Request, Response } from 'express';
import { DetailOrderService } from '../../services/order/DetailOrderService';

class DetailOrderController {
  async handle(req: Request, res: Response) {
    // Pega o ID da mesa que veio pela URL
    const order_id = req.query.order_id as string;

    const detailOrderService = new DetailOrderService();

    const items = await detailOrderService.execute({
      order_id
    });

    return res.json(items); // Devolve a LISTA perfeita pro celular
  }
}

export { DetailOrderController }