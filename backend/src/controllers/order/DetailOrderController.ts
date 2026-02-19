import { Request, Response } from 'express';
import { DetailOrderService } from '../../services/order/DetailOrderService';

class DetailOrderController {
  async handle(req: Request, res: Response){
    // Como é uma busca (GET), vamos pegar o ID pela URL (Query Params)
    // Ex: /order/detail?order_id=123
    const order_id = req.query.order_id as string;

    const detailOrderService = new DetailOrderService();

    const orders = await detailOrderService.execute({
      order_id
    });

    return res.json(orders);
  }
}

export { DetailOrderController }